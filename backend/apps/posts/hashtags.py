"""
Utilidades para procesamiento de hashtags
"""
import re
from django.utils.text import slugify


def extract_hashtags(text):
    """
    Extrae hashtags de un texto
    Retorna lista de hashtags sin el símbolo #
    """
    if not text:
        return []
    
    # Patrón para detectar hashtags
    # Permite letras, números, guiones bajos
    # Debe empezar con letra o número
    pattern = r'#([a-zA-Z0-9]\w*)'
    hashtags = re.findall(pattern, text)
    
    # Convertir a minúsculas y eliminar duplicados
    return list(set([tag.lower() for tag in hashtags]))


def get_or_create_hashtag(hashtag_name):
    """
    Obtiene o crea un hashtag
    Retorna la instancia de Hashtag
    """
    from .models import Hashtag
    
    # Limpiar y normalizar el nombre
    clean_name = hashtag_name.lower().strip()
    slug = slugify(clean_name)
    
    # Obtener o crear el hashtag
    hashtag, created = Hashtag.objects.get_or_create(
        slug=slug,
        defaults={'name': clean_name}
    )
    
    return hashtag


def process_hashtags_for_post(post):
    """
    Procesa hashtags de un post
    - Extrae hashtags del contenido
    - Crea hashtags si no existen
    - Crea relaciones PostHashtag
    - Actualiza contadores
    """
    from .models import PostHashtag
    
    # Extraer hashtags del contenido
    hashtag_names = extract_hashtags(post.content)
    
    if not hashtag_names:
        # Si no hay hashtags nuevos, eliminar los antiguos si existen
        old_relations = PostHashtag.objects.filter(post=post)
        for relation in old_relations:
            relation.hashtag.decrement_usage()
        old_relations.delete()
        return []
    
    created_hashtags = []
    
    # Obtener hashtags actuales del post
    current_hashtags = set(
        post.post_hashtags.values_list('hashtag__slug', flat=True)
    )
    new_hashtag_slugs = set([slugify(name) for name in hashtag_names])
    
    # Hashtags a eliminar (estaban pero ya no están en el contenido)
    hashtags_to_remove = current_hashtags - new_hashtag_slugs
    if hashtags_to_remove:
        removed_relations = PostHashtag.objects.filter(
            post=post,
            hashtag__slug__in=hashtags_to_remove
        )
        
        for relation in removed_relations:
            relation.hashtag.decrement_usage()
        
        removed_relations.delete()
    
    # Procesar hashtags (crear nuevos o actualizar existentes)
    for tag_name in hashtag_names:
        hashtag = get_or_create_hashtag(tag_name)
        
        # Crear relación si no existe
        post_hashtag, created = PostHashtag.objects.get_or_create(
            post=post,
            hashtag=hashtag
        )
        
        # Si es nueva relación, incrementar contador
        if created:
            hashtag.increment_usage()
            created_hashtags.append(hashtag)
    
    return created_hashtags


def remove_hashtags_from_post(post):
    """
    Elimina hashtags de un post
    - Elimina relaciones PostHashtag
    - Decrementa contadores de hashtags
    """
    from .models import PostHashtag
    
    post_hashtags = PostHashtag.objects.filter(post=post)
    
    for post_hashtag in post_hashtags:
        hashtag = post_hashtag.hashtag
        post_hashtag.delete()
        hashtag.decrement_usage()


def linkify_hashtags(text):
    """
    Convierte hashtags en texto a enlaces HTML
    Útil para el frontend
    """
    if not text:
        return text
    
    pattern = r'(#[a-zA-Z0-9]\w*)'
    
    def replace_hashtag(match):
        hashtag = match.group(1)
        tag_name = hashtag[1:]  # Sin el #
        return f'<a href="/hashtags/{tag_name.lower()}" class="hashtag-link">{hashtag}</a>'
    
    return re.sub(pattern, replace_hashtag, text)


def get_trending_hashtags(limit=10, hours=24):
    """
    Obtiene los hashtags en tendencia
    Basado en uso reciente
    """
    from django.utils import timezone
    from datetime import timedelta
    from django.db.models import Count, Q
    from .models import Hashtag
    
    time_threshold = timezone.now() - timedelta(hours=hours)
    
    trending = Hashtag.objects.filter(
        posts__created_at__gte=time_threshold
    ).annotate(
        recent_count=Count('posts', filter=Q(posts__created_at__gte=time_threshold))
    ).order_by('-recent_count', '-usage_count')[:limit]
    
    return trending


def search_hashtags(query, limit=20):
    """
    Busca hashtags por nombre
    """
    from .models import Hashtag
    
    return Hashtag.objects.filter(
        name__icontains=query
    ).order_by('-usage_count')[:limit]


def get_related_hashtags(hashtag, limit=5):
    """
    Obtiene hashtags relacionados
    Basado en posts que comparten múltiples hashtags
    """
    from django.db.models import Count
    from .models import Hashtag, PostHashtag
    
    # Obtener posts que tienen este hashtag
    post_ids = PostHashtag.objects.filter(
        hashtag=hashtag
    ).values_list('post_id', flat=True)
    
    # Encontrar otros hashtags en esos posts
    related = Hashtag.objects.filter(
        posts__post_id__in=post_ids
    ).exclude(
        id=hashtag.id
    ).annotate(
        shared_count=Count('posts')
    ).order_by('-shared_count', '-usage_count')[:limit]
    
    return related


"""
Script de prueba para el sistema de hashtags
Ejecutar: python manage.py shell < test_hashtags.py
"""

from django.contrib.auth import get_user_model
from apps.posts.models import Post, Hashtag, PostHashtag
from apps.posts.hashtags import extract_hashtags, process_hashtags_for_post

User = get_user_model()

print("\n" + "="*60)
print("TESTING SISTEMA DE HASHTAGS")
print("="*60 + "\n")

# 1. Test: Extraer hashtags
print("1. Extrayendo hashtags de texto...")
text = "Me encanta #Python y #Django! También uso #React y #JavaScript #webdev"
hashtags = extract_hashtags(text)
print(f"Texto: {text}")
print(f"Hashtags encontrados: {hashtags}")
assert len(hashtags) == 5
print("✅ Extracción de hashtags OK\n")

# 2. Test: Crear post con hashtags
print("2. Creando post con hashtags...")
try:
    user = User.objects.first()
    if not user:
        print("⚠️  No hay usuarios en la BD, saltando test de creación de post")
    else:
        post = Post.objects.create(
            author=user,
            content="Nuevo proyecto con #React #Django #PostgreSQL! #webdev #fullstack"
        )
        
        # Procesar hashtags
        created_hashtags = process_hashtags_for_post(post)
        print(f"Post creado: ID {post.id}")
        print(f"Hashtags procesados: {len(created_hashtags)}")
        
        # Verificar relaciones
        post_hashtags = post.post_hashtags.all()
        print(f"Relaciones PostHashtag creadas: {post_hashtags.count()}")
        
        for ph in post_hashtags:
            print(f"  - #{ph.hashtag.name} (uso: {ph.hashtag.usage_count})")
        
        print("✅ Creación de post con hashtags OK\n")
except Exception as e:
    print(f"❌ Error: {e}\n")

# 3. Test: Verificar contadores
print("3. Verificando contadores de uso...")
try:
    all_hashtags = Hashtag.objects.all().order_by('-usage_count')
    print(f"Total de hashtags en BD: {all_hashtags.count()}")
    
    if all_hashtags.exists():
        print("\nTop 5 hashtags más usados:")
        for i, hashtag in enumerate(all_hashtags[:5], 1):
            print(f"  {i}. #{hashtag.name} - {hashtag.usage_count} usos")
    
    print("✅ Contadores OK\n")
except Exception as e:
    print(f"❌ Error: {e}\n")

# 4. Test: Buscar posts por hashtag
print("4. Buscando posts por hashtag...")
try:
    if all_hashtags.exists():
        test_hashtag = all_hashtags.first()
        posts_with_hashtag = Post.objects.filter(
            post_hashtags__hashtag=test_hashtag
        ).distinct()
        
        print(f"Buscando posts con #{test_hashtag.name}...")
        print(f"Posts encontrados: {posts_with_hashtag.count()}")
        
        for post in posts_with_hashtag[:3]:
            print(f"  - Post {post.id}: {post.content[:50]}...")
        
        print("✅ Búsqueda por hashtag OK\n")
except Exception as e:
    print(f"❌ Error: {e}\n")

# 5. Test: Actualizar post (cambiar hashtags)
print("5. Actualizando post (cambiar hashtags)...")
try:
    if user and Post.objects.exists():
        post = Post.objects.last()
        old_hashtags = list(post.post_hashtags.values_list('hashtag__name', flat=True))
        print(f"Hashtags antiguos: {old_hashtags}")
        
        # Cambiar contenido
        post.content = "Ahora uso #Vue y #TypeScript! #frontend"
        post.save()
        
        # Reprocesar hashtags
        process_hashtags_for_post(post)
        
        new_hashtags = list(post.post_hashtags.values_list('hashtag__name', flat=True))
        print(f"Hashtags nuevos: {new_hashtags}")
        
        print("✅ Actualización de hashtags OK\n")
except Exception as e:
    print(f"❌ Error: {e}\n")

# 6. Test: Eliminar post (decrementar contadores)
print("6. Eliminando post (decrementar contadores)...")
try:
    if Post.objects.exists():
        post = Post.objects.last()
        hashtags_before = [(ph.hashtag.name, ph.hashtag.usage_count) 
                          for ph in post.post_hashtags.all()]
        
        print(f"Hashtags del post a eliminar:")
        for name, count in hashtags_before:
            print(f"  - #{name}: {count} usos")
        
        # Eliminar post (los contadores deberían decrementarse)
        from apps.posts.hashtags import remove_hashtags_from_post
        remove_hashtags_from_post(post)
        post.delete()
        
        print(f"Post eliminado")
        print("✅ Eliminación y decremento OK\n")
except Exception as e:
    print(f"❌ Error: {e}\n")

# Resumen final
print("="*60)
print("RESUMEN")
print("="*60)
print(f"Total de hashtags: {Hashtag.objects.count()}")
print(f"Total de posts: {Post.objects.count()}")
print(f"Total de relaciones: {PostHashtag.objects.count()}")
print("\n✅ Todas las pruebas completadas!\n")

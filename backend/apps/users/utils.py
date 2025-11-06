import os
import uuid
from datetime import datetime
from PIL import Image
from io import BytesIO
from django.core.files.uploadedfile import InMemoryUploadedFile
import sys


def generate_unique_filename(filename):
    """
    Genera un nombre de archivo único usando UUID y timestamp
    Mantiene la extensión original del archivo
    """
    ext = filename.split('.')[-1] if '.' in filename else 'jpg'
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    unique_id = uuid.uuid4().hex[:8]
    return f"{timestamp}_{unique_id}.{ext}"


def optimize_image(image, max_width=1920, max_height=1080, quality=85, format='JPEG'):
    """
    Optimiza una imagen: redimensiona si es necesario y comprime
    
    Args:
        image: Django UploadedFile object
        max_width: Ancho máximo en píxeles
        max_height: Alto máximo en píxeles
        quality: Calidad de compresión (1-100)
        format: Formato de salida (JPEG, PNG, WebP)
    
    Returns:
        InMemoryUploadedFile optimizado
    """
    # Abrir la imagen
    img = Image.open(image)
    
    # Convertir RGBA a RGB si es necesario (para JPEG)
    if format == 'JPEG' and img.mode in ('RGBA', 'LA', 'P'):
        # Crear un fondo blanco
        background = Image.new('RGB', img.size, (255, 255, 255))
        if img.mode == 'P':
            img = img.convert('RGBA')
        background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
        img = background
    
    # Obtener dimensiones originales
    width, height = img.size
    
    # Calcular nuevas dimensiones manteniendo el aspect ratio
    if width > max_width or height > max_height:
        # Calcular ratio de redimensionamiento
        ratio = min(max_width / width, max_height / height)
        new_width = int(width * ratio)
        new_height = int(height * ratio)
        
        # Redimensionar con antialiasing de alta calidad
        img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
    
    # Guardar en memoria
    output = BytesIO()
    
    # Configurar parámetros de guardado según el formato
    save_kwargs = {'format': format}
    if format == 'JPEG':
        save_kwargs['quality'] = quality
        save_kwargs['optimize'] = True
    elif format == 'PNG':
        save_kwargs['optimize'] = True
    elif format == 'WEBP':
        save_kwargs['quality'] = quality
        save_kwargs['method'] = 6  # Máxima compresión
    
    img.save(output, **save_kwargs)
    output.seek(0)
    
    # Generar nombre único
    original_filename = getattr(image, 'name', 'image.jpg')
    new_filename = generate_unique_filename(original_filename)
    
    # Crear nuevo archivo en memoria
    optimized_image = InMemoryUploadedFile(
        output,
        'ImageField',
        new_filename,
        f'image/{format.lower()}',
        sys.getsizeof(output),
        None
    )
    
    return optimized_image


def optimize_profile_picture(image):
    """
    Optimiza una foto de perfil (más pequeña, circular)
    """
    return optimize_image(image, max_width=500, max_height=500, quality=90)


def optimize_cover_picture(image):
    """
    Optimiza una foto de portada (ancha)
    """
    return optimize_image(image, max_width=1920, max_height=600, quality=85)


def optimize_post_image(image):
    """
    Optimiza una imagen de post
    """
    return optimize_image(image, max_width=1920, max_height=1920, quality=85)

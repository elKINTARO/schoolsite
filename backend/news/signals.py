from django.db.models.signals import post_delete, pre_save
from django.dispatch import receiver

from .models import Post


@receiver(post_delete, sender=Post)
def delete_post_image_on_delete(sender, instance: Post, **kwargs):
    if instance.image:
        try:
            storage = instance.image.storage
            if storage.exists(instance.image.name):
                storage.delete(instance.image.name)
        except Exception:
            # Best-effort cleanup; ignore IO/storage errors
            pass


@receiver(pre_save, sender=Post)
def delete_old_image_on_change(sender, instance: Post, **kwargs):
    if not instance.pk:
        return
    try:
        old_instance = Post.objects.get(pk=instance.pk)
    except Post.DoesNotExist:
        return

    old_file = getattr(old_instance, 'image', None)
    new_file = getattr(instance, 'image', None)

    if old_file and old_file != new_file:
        try:
            storage = old_file.storage
            if storage.exists(old_file.name):
                storage.delete(old_file.name)
        except Exception:
            # Best-effort cleanup; ignore IO/storage errors
            pass



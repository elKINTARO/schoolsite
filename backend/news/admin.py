from django.contrib import admin
from .models import Post


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ("title", "author_name", "created_at", "is_published")
    list_filter = ("is_published", "created_at")
    search_fields = ("title", "content", "author_name")
    readonly_fields = ("created_at", "updated_at")



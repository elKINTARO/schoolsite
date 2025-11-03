from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from .models import Post


def serialize_post(post, request):
    image_url = None
    if post.image:
        try:
            image_url = request.build_absolute_uri(post.image.url)
        except Exception:
            image_url = post.image.url
    return {
        "id": post.id,
        "title": post.title,
        "content": post.content,
        "author": post.author_name,
        "created_at": post.created_at.isoformat(),
        "image": image_url,
    }


@require_http_methods(["GET", "OPTIONS"])  # OPTIONS for CORS preflight
def posts_list(request):
    if request.method == "OPTIONS":
        return JsonResponse({}, status=204)
    posts = Post.objects.filter(is_published=True)
    data = [serialize_post(p, request) for p in posts]
    return JsonResponse({"results": data}, safe=False)



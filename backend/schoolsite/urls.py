from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include, re_path
from django.views.static import serve as static_serve
from schoolsite.frontend_serve import index

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('news.urls')),
    path('', index, name='home'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT) + [
    # Serve frontend files (HTML/CSS/JS/assets/images/favicon), excluding media/
    re_path(r'^(?!media/)(?P<path>(assets/.*|.*\.(?:html|css|js|png|jpg|jpeg|gif|svg|ico)))$',
            static_serve, { 'document_root': settings.FRONTEND_DIR }),
]



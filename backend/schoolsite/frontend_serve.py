from pathlib import Path
from django.conf import settings
from django.http import FileResponse, Http404


def index(request):
    index_path = Path(settings.FRONTEND_DIR) / 'index.html'
    if not index_path.exists():
        raise Http404('index.html not found')
    return FileResponse(open(index_path, 'rb'))



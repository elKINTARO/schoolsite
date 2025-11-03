from django.utils.deprecation import MiddlewareMixin


class SimpleCORSMiddleware(MiddlewareMixin):
    def process_response(self, request, response):
        # Allow all origins including file:// (Origin: null)
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Methods"] = "GET, POST, PUT, PATCH, DELETE, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        response["Access-Control-Allow-Credentials"] = "false"
        return response



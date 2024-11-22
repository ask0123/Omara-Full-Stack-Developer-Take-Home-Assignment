from rest_framework.viewsets import ReadOnlyModelViewSet
from rest_framework.pagination import CursorPagination
from rest_framework.response import Response
from .models import Order
from .serializers import OrderSerializer

class OrderPagination(CursorPagination):
    page_size = 20
    ordering = '-created_at'
    cursor_query_param = 'cursor'

class OrderViewSet(ReadOnlyModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    pagination_class = OrderPagination

    def get_queryset(self):
        queryset = Order.objects.all()
        sort_field = self.request.query_params.get('sort_field', 'created_at')
        sort_direction = self.request.query_params.get('sort_direction', 'desc')
        
        order_by = f"{'-' if sort_direction == 'desc' else ''}{sort_field}"
        return queryset.order_by(order_by)

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        page = self.paginate_queryset(queryset)
        
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            response = self.get_paginated_response(serializer.data)
            response.data['total_count'] = Order.objects.count()
            return response

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
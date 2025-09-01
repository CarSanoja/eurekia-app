from rest_framework.views import APIView
from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status


class SendMessageView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        return Response({'status': 'Message sent'})


class OutboundMessageListView(ListAPIView):
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return []
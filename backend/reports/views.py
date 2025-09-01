from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status


class ProgressReportView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        return Response({'url': 'https://example.com/report.pdf'})


class HeroReportView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        return Response({'url': 'https://example.com/hero.png'})
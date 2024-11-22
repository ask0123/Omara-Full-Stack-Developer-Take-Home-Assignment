import random
from datetime import datetime, timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone
from faker import Faker
from orders.models import Order
import uuid

class Command(BaseCommand):
    help = 'Seed the database with 10,000 orders'

    def handle(self, *args, **kwargs):
        fake = Faker()
        
        # Clear existing orders
        Order.objects.all().delete()
        
        # Generate orders
        orders = []
        start_date = timezone.now() - timedelta(days=365)
        
        self.stdout.write('Generating 10,000 orders...')
        
        for _ in range(10000):
            order = Order(
                id=uuid.uuid4(),
                customer_name=fake.name(),
                amount=round(random.uniform(10, 1000), 2),
                status=random.choice(['pending', 'completed', 'cancelled']),
                created_at=fake.date_time_between(
                    start_date=start_date,
                    end_date=timezone.now(),
                    tzinfo=timezone.get_current_timezone()
                )
            )
            orders.append(order)
            
            # Insert in batches of 1000
            if len(orders) >= 1000:
                Order.objects.bulk_create(orders)
                orders = []
                
        # Insert remaining orders
        if orders:
            Order.objects.bulk_create(orders)
            
        self.stdout.write(self.style.SUCCESS('Successfully created 10,000 orders'))
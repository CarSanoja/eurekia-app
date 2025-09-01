from django.core.management.base import BaseCommand
from django.utils import timezone
from analytics.services import AnalyticsService
from analytics.tasks import (
    calculate_retention_cohorts,
    update_user_engagement_metrics,
    generate_analytics_summary,
    identify_at_risk_users
)


class Command(BaseCommand):
    help = 'Update analytics data and generate reports'

    def add_arguments(self, parser):
        parser.add_argument(
            '--retention',
            action='store_true',
            help='Calculate retention cohorts',
        )
        parser.add_argument(
            '--engagement',
            action='store_true',
            help='Update user engagement metrics',
        )
        parser.add_argument(
            '--summary',
            action='store_true',
            help='Generate analytics summary',
        )
        parser.add_argument(
            '--at-risk',
            action='store_true',
            help='Identify at-risk users',
        )
        parser.add_argument(
            '--all',
            action='store_true',
            help='Run all analytics updates',
        )

    def handle(self, *args, **options):
        self.stdout.write(
            self.style.SUCCESS(
                f'Starting analytics update at {timezone.now()}'
            )
        )

        if options['retention'] or options['all']:
            self.stdout.write('Calculating retention cohorts...')
            try:
                result = calculate_retention_cohorts()
                self.stdout.write(
                    self.style.SUCCESS(f'✓ Retention: {result}')
                )
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f'✗ Retention failed: {str(e)}')
                )

        if options['engagement'] or options['all']:
            self.stdout.write('Updating engagement metrics...')
            try:
                result = update_user_engagement_metrics()
                self.stdout.write(
                    self.style.SUCCESS(f'✓ Engagement: {result}')
                )
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f'✗ Engagement failed: {str(e)}')
                )

        if options['summary'] or options['all']:
            self.stdout.write('Generating analytics summary...')
            try:
                result = generate_analytics_summary()
                self.stdout.write(
                    self.style.SUCCESS(f'✓ Summary: {result["daily_active_users"]} daily active users')
                )
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f'✗ Summary failed: {str(e)}')
                )

        if options['at_risk'] or options['all']:
            self.stdout.write('Identifying at-risk users...')
            try:
                result = identify_at_risk_users()
                self.stdout.write(
                    self.style.SUCCESS(f'✓ At-risk: {result["at_risk_count"]} users identified')
                )
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f'✗ At-risk identification failed: {str(e)}')
                )

        self.stdout.write(
            self.style.SUCCESS(
                f'Analytics update completed at {timezone.now()}'
            )
        )
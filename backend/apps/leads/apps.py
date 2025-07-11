from django.apps import AppConfig

class LeadsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.leads'  # ← this must match the folder path

    def ready(self):
        import apps.leads.signals  # noqa: F401

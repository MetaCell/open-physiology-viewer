import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import 'zone.js'
import { TestAppModule } from './app';

platformBrowserDynamic().bootstrapModule(TestAppModule);

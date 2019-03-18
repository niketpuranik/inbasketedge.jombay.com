import { Routes, RouterModule } from '@angular/router';
import { DataResolver } from './app.resolver';

import {
	BackgroundInfoComponent,
	ThankYouComponent,
	BaseComponent
} from './components';

import { AuthenticationService } from './services';

export const ROUTES: Routes = [
	{
		path: '',
		component: BackgroundInfoComponent
	},
	{
		path: 'base/:index',
		component: BaseComponent
	},
	{
		path: 'base',
		component: BaseComponent
	},
	{
		path: 'thank_you',
		component: ThankYouComponent
	},
	{
		path: '**',
		redirectTo: '/',
		pathMatch: 'full'
	},
	{
		path: 'companies/:company_id/company_simulations/:company_simulation_id/user_company_simulations/:user_company_simulation_id',
		component: BackgroundInfoComponent
	}
];

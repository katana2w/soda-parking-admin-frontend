import { Routes, RouterModule } from '@angular/router';

import { LoginComponent } from './login';
import { RulesComponent } from './rules/rules.component';
// @ts-ignore
import { GoogleMapComponent } from './google-map';
import { AuthGuard } from './_helpers';

const routes: Routes = [
    { path: '', component: GoogleMapComponent, canActivate: [AuthGuard] },
    { path: 'login', component: LoginComponent },
    { path: 'rules', component: RulesComponent },

    // otherwise redirect to home
    { path: '**', redirectTo: '' }
];

export const appRoutingModule = RouterModule.forRoot(routes,  {
    onSameUrlNavigation: 'reload'
});

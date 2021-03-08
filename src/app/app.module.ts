import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpClientModule, HTTP_INTERCEPTORS} from '@angular/common/http';

// used to create fake backend
// import {fakeBackendProvider} from './_helpers';

import {AppComponent} from './app.component';
import {appRoutingModule} from './app.routing';

import {BasicAuthInterceptor, ErrorInterceptor} from './_helpers';
import {HomeComponent} from './home';
import {LoginComponent} from './login';
import {GoogleMapComponent} from './google-map/google-map.component';

import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatFormFieldModule, MatInputModule} from '@angular/material';
import {MatDialogModule} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import {MatListModule} from '@angular/material/list';
import {MatIconModule} from '@angular/material/icon';
import {MatSelectModule} from '@angular/material/select';

import {DialogMessageComponent} from './dialog-message/dialog-message.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { RulesComponent } from './rules/rules.component';
import { DialogRuleComponent } from './dialog-rule/dialog-rule.component'

@NgModule({
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    HttpClientModule,
    appRoutingModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatDialogModule,
    MatButtonModule,
    MatListModule,
    MatIconModule,
    MatSelectModule,
    BrowserAnimationsModule,
    MatInputModule,
    FormsModule
  ],
  entryComponents: [
    DialogMessageComponent,
    DialogRuleComponent
  ],
  declarations: [
    AppComponent,
    HomeComponent,
    LoginComponent,
    GoogleMapComponent,
    DialogMessageComponent,
    RulesComponent,
    DialogRuleComponent ],
  providers: [
    {provide: HTTP_INTERCEPTORS, useClass: BasicAuthInterceptor, multi: true},
    {provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true},

    // provider used to create fake backend
    // fakeBackendProvider
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}

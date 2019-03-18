import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RestangularModule } from 'ng2-restangular';
import {
  CustomMaterialModule
} from './modules';

import { CookieService } from 'angular2-cookie/services/cookies.service';
import { APP_BASE_HREF, Location } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { api } from '../../config/vger';

import 'hammerjs';

import {
  NgModule,
  ApplicationRef
} from '@angular/core';

import {
  removeNgStyles,
  createNewHosts,
  createInputTransfer
} from '@angularclass/hmr';

import {
  RouterModule,
  PreloadAllModules
} from '@angular/router';

/*
 * Platform and Environment providers/directives/pipes
 */
import { ENV_PROVIDERS } from './environment';
import { ROUTES } from './app.routes';

// App is our top level component
import { AppComponent } from './app.component';

import {
   OnboardingComponent,
   BackgroundInfoComponent,
   ThankYouComponent,
   InboxComponent,
   CalendarComponent,
   IntroductionComponent,
   TeamComponent,
   AssignPriorityComponent,
   AssignEmailComponent,
   ReplyComponent,
   MarkForFutureComponent,
   LongReplyComponent,
   BaseComponent,
   SetCalendarEventDialogComponent,
   AlertDialogComponent,
   ConfirmDialogComponent
  } from './components';

import { APP_RESOLVER_PROVIDERS } from './app.resolver';
import { AppState, InternalStateType } from './app.service';

import { AuthenticationService,
  ApiService,
  SimulationService,
  CommonService } from './services';

// import { } from './modules';

import '../styles/styles_in.scss';

export function RestangularConfigFactory (RestangularProvider) {
  RestangularProvider.setBaseUrl(api.protocol+'://'+api.host);
  RestangularProvider.setPlainByDefault(true);
  RestangularProvider.setDefaultHeaders({
      'Content-Type': 'application/json',
       Accept: 'application/json'
    });
}

// Application wide providers
const APP_PROVIDERS = [
  ...APP_RESOLVER_PROVIDERS,
  AppState
];

type StoreType = {
  state: InternalStateType,
  restoreInputValues: () => void,
  disposeOldHosts: () => void
};

/**
 * `AppModule` is the main entry point into Angular2's bootstraping process
 */
@NgModule({
  bootstrap: [ AppComponent, OnboardingComponent ],
  entryComponents:[
    SetCalendarEventDialogComponent,
    AlertDialogComponent,
    ConfirmDialogComponent
  ],
  declarations: [
    AppComponent,
    BackgroundInfoComponent,
    OnboardingComponent,
    ThankYouComponent,
    InboxComponent,
    CalendarComponent,
    IntroductionComponent,
    TeamComponent,
    AssignPriorityComponent,
    AssignEmailComponent,
    ReplyComponent,
    MarkForFutureComponent,
    LongReplyComponent,
    BaseComponent,
    SetCalendarEventDialogComponent,
    AlertDialogComponent,
    ConfirmDialogComponent
  ],
  imports: [
    FormsModule,
    BrowserModule,
    HttpModule,
    RestangularModule.forRoot(RestangularConfigFactory),
    BrowserAnimationsModule,
    CustomMaterialModule,
    RouterModule.forRoot(ROUTES, { preloadingStrategy: PreloadAllModules })
  ],
  providers: [
    ENV_PROVIDERS,
    APP_PROVIDERS,
    CookieService,
    ApiService,
    AuthenticationService,
    SimulationService,
    CommonService,
    AppComponent,
    InboxComponent,
    { provide: APP_BASE_HREF, useValue: window['_app_base'] || '/' },
  ]
})
export class AppModule {

  constructor(
    public appRef: ApplicationRef,
    public appState: AppState
  ) {}

  public hmrOnInit(store: StoreType) {
    if (!store || !store.state) {
      return;
    }
    // set state
    this.appState._state = store.state;
    // set input values
    if ('restoreInputValues' in store) {
      let restoreInputValues = store.restoreInputValues;
      setTimeout(restoreInputValues);
    }

    this.appRef.tick();
    delete store.state;
    delete store.restoreInputValues;
  }

  public hmrOnDestroy(store: StoreType) {
    const cmpLocation = this.appRef.components.map((cmp) => cmp.location.nativeElement);
    // save state
    const state = this.appState._state;
    store.state = state;
    // recreate root elements
    store.disposeOldHosts = createNewHosts(cmpLocation);
    // save input values
    store.restoreInputValues  = createInputTransfer();
    // remove styles
    removeNgStyles();
  }

  public hmrAfterDestroy(store: StoreType) {
    // display new elements
    store.disposeOldHosts();
    delete store.disposeOldHosts;
  }

}

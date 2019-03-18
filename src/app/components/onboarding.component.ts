import { Component, ElementRef, AfterContentInit, OnInit, HostListener } from '@angular/core';
import { AuthenticationService } from '../services';
import { ApiService, SimulationService, CommonService } from '../services';
import { ActivatedRoute, Params, Router } from '@angular/router';
import * as MasterData from '../master_data';
import * as Qs from 'qs/dist/qs';

@Component({
  selector: 'onboarding',
  templateUrl: '../templates/onboarding.component.html'
})

export class OnboardingComponent implements OnInit{
  public selectedIndex: number = 0;
  public instructionsIndex: number = 0;
  public showActions: boolean = true;
  public finish: boolean = false;
  public isAuthonticated: boolean = false;
  public total_images: number = 8;
  public readInstructionFlag: boolean = false;
  public simulationTime: number= 45;
  public simulationDescription: string;
  public guiding_text: string;
  public image_base_url: string = "";

  public number_of_days: number = 0;
  public min_per_day: number = 4;
  public total_duration: number = 20;
  public company_name: string;
  public background_info: string;
  public s3_asset_folder: string;

  constructor(
      private authService: AuthenticationService,
      private simulationService: SimulationService,
      private apiService: ApiService,
      private activatedRoute: ActivatedRoute,
      private commonService: CommonService,
      private router: Router
    ) { }

  scrollHandler($event) {

  }

  public ngOnInit() {
    this.image_base_url = MasterData.IMAGE_BASE_URL;
    if(this.authService.isAuthorized()) {
      this.getData();
    } else {
      this.activatedRoute.queryParams
      .debounceTime(500)
      .subscribe((params: Params) => {
        var token = params["auth_token"];
        this.authenticateUser(token);
      });
    }
    this.setBaseUrl();
  }

  setBaseUrl() {
    var url = window.location.href.split( '/' );
    MasterData.setBaseUrl(url.slice(url.indexOf("companies"), url.indexOf("companies")+6).join("/"));
  }

  authenticateUser(token) {
    if(token) {
      MasterData.setAuthToken(token);
      this.authService.authenticate({
        auth_token: token,
        grant_type:"password",
        scope: "user"
      }).subscribe(response => {
        this.getData();
      }, (errors) => {
        this.showUnauthorisedAlert();
      });
    } else {
      this.showUnauthorisedAlert();
    }
  }
  showUnauthorisedAlert() {
    this.commonService.alert("You are unauthorized to access this page.<br> Please check the link provided to you.");
    this.guiding_text = "You are unauthorized to access this page.";
  }
  getData() {
    if(!this.finish) {
      this.apiService.show(MasterData.BASE_URL + "?" + Qs.stringify({
        include: {
          user: {
            include: 'user'
          },
          company_simulation: {
            include: {
              simulation: {
                include: {
                  emails: {
                    except: ['activities']
                  },
                  persons: {
                    except: [
                      'activities'
                    ]
                  }
                }
              },
              company: {
                include: ['name']
              }
            }
          }
        }
      },{ arrayFormat: 'brackets' }) , "", {}).subscribe(response => {
        var user_company_simulation = response.user_company_simulation;
        this.simulationService.setInitialData(response);
        this.simulationTime = MasterData.SIMULATION.time;
        this.simulationDescription = MasterData.SIMULATION.description;
        this.s3_asset_folder = MasterData.S3_ASSET_FOLDER;
        if(response.user_company_simulation.status != MasterData.SIMULATION_STATUSES['sent']) {
          this.simulationService.simulationFetched.emit(MasterData.USER_COMPANY_SIMULATION);
          this.finish = true;
        } else {
          this.isAuthonticated = true;
          this.setInstructionsData(user_company_simulation);
        }
      }, () => {
        this.commonService.alert("Error in fetching the data. <br>Please reload the page.");
        this.guiding_text = "Error in fetching the data. Please reload the page.";
      });
    }
  }

  setInstructionsData(user_company_simulation) {
    var simulation = user_company_simulation.company_simulation.simulation;

    var endTime = this.commonService.newDate(simulation.end_date).getTime();
    var startTime = this.commonService.newDate(simulation.start_date).getTime();

    var days:number = (endTime - startTime)/(24*3600*1000);

    this.company_name = user_company_simulation.company_simulation.company.company.name;

    this.number_of_days = days;
    this.total_duration = simulation.time;
    this.min_per_day = this.total_duration/days;
    this.background_info = MasterData.SIMULATION.description;
  }

  next() {
    ++this.selectedIndex;
  }

  previous() {
    --this.selectedIndex;
  }

  previousInstruction() {
    this.instructionsIndex > 0 ? --this.instructionsIndex : this.instructionsIndex = 0;
  }

  nextInstruction() {
    this.instructionsIndex < 5 ? ++this.instructionsIndex : this.instructionsIndex = 5;
  }

  finishOnboarding(){
    MasterData.USER_COMPANY_SIMULATION.status = MasterData.SIMULATION_STATUSES['started'];
    this.apiService.beginSimulation();
    this.simulationService.simulationFetched.emit(MasterData.USER_COMPANY_SIMULATION);
    this.router.navigate(['/base'], { skipLocationChange: true, preserveQueryParams: true });
    this.finish = true;
  }

  updateImageUrl(event) {
    event.srcElement.src = event.src;
  }
}

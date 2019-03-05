import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { IonicPage, NavController, ToastController } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import { User } from '../../providers';
import { MainPage } from '../';
import { Api } from '../../providers';
import { HttpHeaders } from '@angular/common/http';
import { Headers,RequestOptions } from '@angular/http';
import { HttpServiceProvider } from '../../providers/api/soap-service';
import { ThrowStmt } from '@angular/compiler';
import xml2js from 'xml2js';
import { GlobalProvider } from "../../providers/global/global";
import { LoadingController } from 'ionic-angular';
@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage {
  // The account fields for the login form.
  // If you're using the username field with or without email, make
  // sure to add it to the type
  loading;
  account: { email: string, password: string } = {
    email: 'GUNDAA',
    password: '2025!'
  };
  private navCtrler: NavController;
  // Our translated text strings
  private loginErrorString: string;
  ionViewWillEnter() {
    this.account.password = "";
    this.account.email = "";
  }
  constructor(public navCtrl: NavController,
    public user: User,
    public toastCtrl: ToastController,
    public translateService: TranslateService,
    public api: Api,
    public loadingCtrl: LoadingController,
    public api2: HttpServiceProvider,public global: GlobalProvider,
    public alertController: AlertController) {
    this.navCtrler = navCtrl;
    this.translateService.get('LOGIN_ERROR').subscribe((value) => {
      this.loginErrorString = value;
    });
    this.loading = this.loadingCtrl.create({
      content: 'Please wait...',
      dismissOnPageChange: false
    });
  }

  // Attempt to login in through our User service
  async doLogin() {
    // this.user.login(this.account).subscribe((resp) => {
    //   this.navCtrl.push(MainPage);
    // }, (err) => {
    //   this.navCtrl.push(MainPage);
    //   // Unable to log in
    //   let toast = this.toastCtrl.create({
    //     message: this.loginErrorString,
    //     duration: 3000,
    //     position: 'top'
    //   });
    //   toast.present();
    // });

    //  var headers = new Headers({ 'Content-Type': 'text/xml' });
    // const headers = new HttpHeaders().set(
    //         'Content-Type',
    //         'text/xml'
    //       );
    // headers.set('Authorization', 'Bearer 9f6d1c7f-050b-32f1-a90a-db178adf8751');

    // headers.append('withCredentials', 'true');
    // headers.set('Access-Control-Allow-Origin', '*');
    // const requestOptions = new RequestOptions({ headers: headers });

    // var reqOpts = {
    //           headers: headers
    //         };

    this.showSpinner();
    // let xmlData = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:quer="http://ws.cdyne.com/PhoneVerify/query"><soapenv:Header/><soapenv:Body><quer:CheckPhoneNumber><!--Optional:--><quer:PhoneNumber>18006785432</quer:PhoneNumber><!--Optional:--><quer:LicenseKey>0</quer:LicenseKey></quer:CheckPhoneNumber></soapenv:Body></soapenv:Envelope>';
    let sapData = `<soapenv:Envelope xmlns:soapenv="http://www.w3.org/2003/05/soap-envelope" xmlns:urn="urn:sap-com:document:sap:soap:functions:mc-style"> <soapenv:Header/> <soapenv:Body> <urn:ZsusrCheckLogonData> <Aliasname> </Aliasname> <AuthData></AuthData> <AuthMethod>P</AuthMethod> <ExtidType></ExtidType> <Language>EN</Language> <Password>${this.account.password}</Password> <UseNewException></UseNewException> <Userid>${this.account.email}</Userid> </urn:ZsusrCheckLogonData> </soapenv:Body></soapenv:Envelope>`;
    
    // this.api.post('', xmlData,reqOpts).subscribe(data => {
    //   let strData = JSON.stringify(data);
    //   console.log(strData);
    //  this.presentAlert("Login SUCCESS!" + strData);
    //   this.navCtrl.push(MainPage);
    // }, error => {
    //   let strErr = JSON.stringify(error);
    //   console.log(strErr);
    //   this.navCtrl.push(MainPage);
    //  this.presentAlert("Login Error:" + strErr);
    // });
    var returnData = await this.api2.makePostSoapRequest('saplogon/1.0/', sapData);
    let retStr = returnData as string;
    //this.presentAlert("retStr: "+ retStr);
    if(retStr=="")
    {
     this.presentAlert("Request error !");
     this.hideSpinner();
      return;
    }
    else
    {
      let parser = new DOMParser();
      let doc = parser.parseFromString(retStr, "application/xml");
      // this.presentAlert("Doc: "+ doc.textContent);
      // var rsStr =doc.getElementsByTagName("env:Envelope")[0].getElementsByTagName("env:Body")[0] as HTMLElement;
      var typeEle = doc.getElementsByTagName("Message")[0].getElementsByTagName("Type")[0].textContent as string;
      this.hideSpinner();
      if(typeEle == null || typeEle.toUpperCase() == "E")
      {
       this.presentAlert("User or password is incorrect !");
      }
      else
      {
        this.global.loginUser = this.account.email;
        this.navCtrl.push(MainPage);
      }
    }
  }

  // loginResp(result)
  // {
  // // this.presentAlert("Login SUCCESS!" + result.responseText);
  //   this.navCtrl.push(MainPage);
  // }

  public showSpinner() {
    this.loading.present();
  }

  public hideSpinner() {
    this.loading.dismiss();
    this.loading = this.loadingCtrl.create({
      content: 'Please wait...',
      dismissOnPageChange: false
    });
  }

  presentAlert(info) {
    let alert = this.alertController.create({
      title: 'Alert',
      subTitle: info,
      buttons: ['OK']
    });
    setTimeout(() => {
      alert.present();
    }, 1000);
  }
}

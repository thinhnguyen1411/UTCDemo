import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams,ModalController } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import { Item } from '../../models/item';
import { Items } from '../../providers';
import { Materials } from '../../providers';
import { HttpServiceProvider } from '../../providers/api/soap-service';
import { Api } from '../../providers';
import { Http, Headers, RequestOptions } from '@angular/http';
import { LoadingController } from 'ionic-angular';
import { GlobalProvider } from "../../providers/global/global";
import * as _ from 'lodash';
@IonicPage()
@Component({
  selector: 'page-item-detail',
  templateUrl: 'item-detail.html'
})
export class ItemDetailPage {
  loading;
  selectedPO: any;
  currentItems: Item[]=[];
  allItems: Item[]=[];
  poHeader: any;
  isApproved: boolean = false;
  page = 1;
  pageSize = 10;
  itemsPerPage;

  constructor(public navCtrl: NavController, navParams: NavParams, public loadingCtrl: LoadingController, public items: Items,public api2: HttpServiceProvider, public modalCtrl: ModalController,public alertController: AlertController,public api: Api, public global: GlobalProvider) {
    this.selectedPO = navParams.get('item') || items.defaultItem;
    this.poHeader = this.selectedPO.Ebeln;
    this.loading = this.loadingCtrl.create({
      content: 'Please wait...',
      dismissOnPageChange: false
    });
    this.loadPOItemData();
  }

  async loadPOItemData()
  {
    this.showSpinner();
    if(this.selectedPO.Status == "A")
      this.isApproved = true;
    let sapData = `<soapenv:Envelope xmlns:soapenv="http://www.w3.org/2003/05/soap-envelope" xmlns:urn="urn:sap-com:document:sap:soap:functions:mc-style"> <soapenv:Header/> <soapenv:Body> <urn:ZmobilePoItem> <Poitem> <item> <Ebeln></Ebeln> <Ebelp></Ebelp> <Knttp></Knttp> <Matnr></Matnr> <Maktg></Maktg> <Menge></Menge> <Meins></Meins> <Eindt></Eindt> <Netpr></Netpr> </item> </Poitem> <Ponumber>${this.selectedPO.Ebeln}</Ponumber> </urn:ZmobilePoItem> </soapenv:Body></soapenv:Envelope>`;
    if(this.global.isDebug)
      this.presentAlert("Request Data: " + sapData);
    var returnData = await this.api2.makePostSoapRequest('poitem/1.0/', sapData);
    let retDataStr= returnData as string;
    if(this.global.isDebug)
      this.presentAlert("Response Data: " + retDataStr);
    if(retDataStr=="")
    {
     this.presentAlert("Request error !");
     this.hideSpinner();
      return;
    }
    else
    {
      let parser = new DOMParser();
      let doc = parser.parseFromString(retDataStr, "application/xml");
      // var rsObj=doc.getElementsByTagName("env:Envelope")[0].getElementsByTagName("env:Body")[0] as HTMLElement;
      var listPOs = Array.from(doc.getElementsByTagName("Poitem")[0].childNodes);
      // var listPOCount = doc.getElementsByTagName("Poitem")[0].childNodes.length;
      var i=0;
      listPOs.forEach(function (poObj) {
        if(i==0)
        {
          i++;
          return;
        }
        //this.presentAlert("for");
        var Ebeln = poObj.childNodes[0].textContent as string;
        // alert(Ebeln);
        var Ebelp = poObj.childNodes[1].textContent as string;
        // alert(Ebelp);
        var Knttp = poObj.childNodes[2].textContent as string;
        // alert(Knttp);
        var Matnr = poObj.childNodes[3].textContent as string;
        // alert(Matnr);
        var Maktg = poObj.childNodes[4].textContent as string;
        // alert(Maktg);
        var Menge = poObj.childNodes[5].textContent as string;
        // alert(Menge);
        var Meins = poObj.childNodes[6].textContent as string;
        // alert(Meins);
        var Eindt = poObj.childNodes[7].textContent as string;
        // alert(Eindt);
        var Netpr = poObj.childNodes[8].textContent as string;
        // alert(Netpr);
        var itemJson ={
          "Ebelp": Ebelp,
          "Ebeln": Ebeln,
          "Knttp": Knttp,
          "Matnr": Matnr,
          "Maktg": Maktg,
          "Menge": Menge,
          "Meins": Meins,
          "Eindt": Eindt,
          "Netpr": Netpr
        };
  
        var item = new Item(itemJson);
        this.allItems.push(item);
      }.bind(this));
      this.itemsPerPage = this.global.getPaginatedItems(this.allItems, this.page, this.pageSize);
      this.currentItems = _.concat(this.currentItems, this.itemsPerPage.data);

      this.hideSpinner();
    }
  }

  ionViewWillEnter() {
    this.page = 1;
  }

  doInfinite(infiniteScroll) {
    console.log('Begin async operation');

    setTimeout(() => {
      if (this.page < this.itemsPerPage.total_pages) {
        this.page = this.page + 1;
        this.itemsPerPage = this.global.getPaginatedItems(this.allItems, this.page, this.pageSize);
        this.currentItems = _.concat(this.currentItems, this.itemsPerPage.data);
      }

      console.log('Async operation has ended');
      infiniteScroll.complete();
    }, 500);
  }

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
  async doApprove(ponum:string,actionStr:string) {
    this.loading = this.loadingCtrl.create({
      content: 'Please wait...',
      dismissOnPageChange: true
    });
    this.showSpinner();
    let sapData = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:soap:functions:mc-style"><soapenv:Header/><soapenv:Body><urn:ZmobilePoRelease><Apprej>${actionStr}</Apprej><Ponumber>${ponum}</Ponumber><Return><item><Type></Type><Code></Code><Message></Message><LogNo></LogNo><LogMsgNo></LogMsgNo><MessageV1></MessageV1><MessageV2></MessageV2><MessageV3></MessageV3><MessageV4></MessageV4></item></Return></urn:ZmobilePoRelease></soapenv:Body></soapenv:Envelope>`;
    //if(this.global.isDebug)
    {
      setTimeout(() => {
        alert("App Ver: "+this.global.buildNum +" Request Data: " + sapData);
      }, 1000);
      
    }
    var returnData = await this.api2.makePostSoapRequest('poapproval/1.0/', sapData);
    let retDataStr= returnData as string;
   // if(this.global.isDebug)
    {
      setTimeout(() => {
        alert("App Ver: "+this.global.buildNum +" Response Data: " + retDataStr);
      }, 1000);
    }
      
    this.hideSpinner();
    if(retDataStr=="")
    {
     this.presentAlert("Request error !");
    }
    else
    {
      let parser = new DOMParser();
      let doc = parser.parseFromString(retDataStr, "application/xml");
      // var rsObj=doc.getElementsByTagName("env:Envelope")[0].getElementsByTagName("env:Body")[0] as HTMLElement;
      var statusObj = doc.getElementsByTagName("Status")[0] as HTMLElement;
      // alert(statusObj);
      if(statusObj != null)
      {
        var statusTxt= statusObj.textContent as string;
        if(statusTxt != "")
        {
          if(actionStr == "1")
          {
            this.isApproved = true;
            this.presentAlert("Approve succeed !");
          }
          else
           this.presentAlert("Invalid approval action !");
        }
        else
        {
          var msgObj = doc.getElementsByTagName("item")[0].getElementsByTagName("Message")[0].textContent as string;
          if(actionStr == "2")
          {
            if(msgObj == "")
              this.presentAlert("Reject succeed !");
            else
              this.presentAlert(`PO ${this.selectedPO.Ebeln} already rejected`);
          }
          else
            this.presentAlert(`PO ${this.selectedPO.Ebeln} already approved`);
          
        }
      } 
    }
    //this.hideSpinner();
  }
}

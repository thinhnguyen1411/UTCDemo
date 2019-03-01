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
  constructor(public navCtrl: NavController, navParams: NavParams, public loadingCtrl: LoadingController, public items: Items,public api2: HttpServiceProvider, public modalCtrl: ModalController,public alertController: AlertController,public api: Api) {
    this.selectedPO = navParams.get('item') || items.defaultItem;
    this.poHeader = this.selectedPO.Ebeln;
    this.loading = this.loadingCtrl.create({
      content: 'Please wait...',
      dismissOnPageChange: true
    });
    this.loadPOItemData();
  }

  async loadPOItemData()
  {
    this.showSpinner();
    if(this.selectedPO.Status == "A")
      this.isApproved = true;
    let sapData = `<soapenv:Envelope xmlns:soapenv="http://www.w3.org/2003/05/soap-envelope" xmlns:urn="urn:sap-com:document:sap:soap:functions:mc-style"> <soapenv:Header/> <soapenv:Body> <urn:ZmobilePoItem> <Poitem> <item> <Ebeln></Ebeln> <Ebelp></Ebelp> <Knttp></Knttp> <Matnr></Matnr> <Maktg></Maktg> <Menge></Menge> <Meins></Meins> <Eindt></Eindt> <Netpr></Netpr> </item> </Poitem> <Ponumber>${this.selectedPO.Ebeln}</Ponumber> </urn:ZmobilePoItem> </soapenv:Body></soapenv:Envelope>`;
    alert("Request Data: " + sapData);
    var returnData = await this.api2.makePostSoapRequest('poitem/1.0/', sapData);
    let retDataStr= returnData as string;
    alert("Response Data: " + retDataStr);
    if(retDataStr=="")
    {
      alert("Request error !");
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
        // alert("for");
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
      this.currentItems = this.allItems;
    }
  }

  public showSpinner() {
    this.loading.present();
  }

  public hideSpinner() {
  	this.loading.dismiss();
  }

  presentAlert(info) {
    let alert = this.alertController.create({
      title: 'Alert',
      subTitle: info,
      buttons: ['OK']
    });
    alert.present();
  }
  async doApprove(ponum:string,actionStr:string) {
    this.loading = this.loadingCtrl.create({
      content: 'Please wait...',
      dismissOnPageChange: true
    });
    this.showSpinner();
    let sapData = `<soapenv:Envelope xmlns:soapenv="http://www.w3.org/2003/05/soap-envelope" xmlns:urn="urn:sap-com:document:sap:soap:functions:mc-style"> <soapenv:Header/> <soapenv:Body> <urn:ZmobilePoReject> <Apprej>${actionStr}</Apprej> <Ponumber>${ponum}</Ponumber> <Return> <item> <Type></Type> <Code></Code> <Message></Message> <LogNo></LogNo> <LogMsgNo></LogMsgNo> <MessageV1></MessageV1> <MessageV2></MessageV2> <MessageV3></MessageV3> <MessageV4></MessageV4> </item> </Return> </urn:ZmobilePoReject> </soapenv:Body></soapenv:Envelope>`;
    alert("Request Data: " + sapData);
    var returnData = await this.api2.makePostSoapRequest('poapproval/1.0/', sapData);
    let retDataStr= returnData as string;
    alert("Response Data: " + retDataStr);
    if(retDataStr=="")
    {
      alert("Request error !");
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
            alert("Approve succeed !");
          else if(actionStr == "2")
            alert("Reject succeed !");
          else
            alert("Invalid approval action !");
        }
        else
        {
          // var msgObj = doc.getElementsByTagName("item")[0].getElementsByTagName("Message")[0].textContent as string;
            alert(`PO ${this.selectedPO.Ebeln} Already Approved`);
          
        }
      } 
    }
    this.hideSpinner();
  }
}

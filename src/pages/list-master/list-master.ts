import { Component } from '@angular/core';
import { IonicPage, ModalController, NavController } from 'ionic-angular';
import { HttpServiceProvider } from '../../providers/api/soap-service';
import { Item } from '../../models/item';
import { Items } from '../../providers';
import { AlertController } from 'ionic-angular';
import { GlobalProvider } from "../../providers/global/global";
import { LoadingController } from 'ionic-angular';
import * as _ from 'lodash';
import { LoginPage } from '../login/login';
@IonicPage()
@Component({
  selector: 'page-list-master',
  templateUrl: 'list-master.html'
})
export class ListMasterPage {
  page = 1;
  pageSize = 10;
  itemsPerPage;

  loading;
  currentItems: Item[] = [];
  allItems: Item[] = [];
  constructor(public navCtrl: NavController, public items: Items, public loadingCtrl: LoadingController, public modalCtrl: ModalController, public api2: HttpServiceProvider, public alertController: AlertController, public global: GlobalProvider) {
    //this.currentItems = this.items.query();
  }

  presentProfileModal() {
    let profileModal = this.modalCtrl.create(LoginPage);
    profileModal.present();
  }

  ionViewWillEnter() {
    this.currentItems = [];
    this.page = 1;
    this.allItems = [];
    this.loading = this.loadingCtrl.create({
      content: 'Please wait...',
      dismissOnPageChange: false
    });
    this.loadPOListData();
  }

  doFilter() {
    this.presentProfileModal();
  }
  async loadPOListData() {
    let sapData = `<soapenv:Envelope xmlns:soapenv="http://www.w3.org/2003/05/soap-envelope" xmlns:urn="urn:sap-com:document:sap:soap:functions:mc-style"> <soapenv:Header/> <soapenv:Body> <urn:ZmobilePoHeader> <PurchaseHeader> <item> <Sno></Sno> <Ebeln></Ebeln> <Aedat></Aedat> <Utime></Utime> <Netwr></Netwr> <Status></Status> </item> </PurchaseHeader> <Username>${this.global.loginUser}</Username> </urn:ZmobilePoHeader> </soapenv:Body></soapenv:Envelope>`;
    if(this.global.isDebug)
    {
      this.presentAlert("Login User: " + this.global.loginUser);
      this.presentAlert("Request Data: " + sapData);
    }
    this.showSpinner();
    var returnData = await this.api2.makePostSoapRequest('poheader/1.0/', sapData);
    let retDataStr = returnData as string;
    if(this.global.isDebug)
    {
      this.hideSpinner();
      this.presentAlert("Response Data: " + retDataStr);
    }
    if (retDataStr == "") {
      this.hideSpinner();
      this.presentAlert("Request error !");
      return;
    }
    else {
     
      let parser = new DOMParser();
      let doc = parser.parseFromString(retDataStr, "application/xml");
      // var rsObj=doc.getElementsByTagName("env:Envelope")[0].getElementsByTagName("env:Body")[0] as HTMLElement;
      var listPOs = Array.from(doc.getElementsByTagName("PurchaseHeader")[0].childNodes);
      // var listPOCount = doc.getElementsByTagName("PurchaseHeader")[0].childNodes.length;
      if (listPOs.length == 1) {
        if (listPOs[0].childNodes[5] != null) {
          var StatusStr = listPOs[0].childNodes[5].textContent as string;
          if (StatusStr == "") {
            this.hideSpinner();
           
              this.presentAlert("The logged in user doesn't have any PO yet !");
            
            
            return;
          }
        }
      }
      var i = 0;
      listPOs.forEach(function (poObj) {
        if (i == 0) {
          i++;
          return;
        }
        //this.presentAlert("for begin");
        var Sno = poObj.childNodes[0].textContent as string;
        // alert(Sno);
        var Ebeln = poObj.childNodes[1].textContent as string;
        // alert(Ebeln);
        var Aedat = poObj.childNodes[2].textContent as string;
        // alert(Aedat);
        var Utime = poObj.childNodes[3].textContent as string;
        // alert(Utime);
        var Netwr = poObj.childNodes[4].textContent as string;
        // alert(Netwr);
        var Status = poObj.childNodes[5].textContent as string;
        // alert(StatusStr);
        if (Status != "P")
          return;
        var itemJson = {
          "Sno": Sno,
          "Ebeln": Ebeln,
          "Aedat": Aedat,
          "Utime": Utime,
          "Netwr": Netwr,
          "Status": Status,
        };

        var item = new Item(itemJson);
        this.allItems.push(item);
      }.bind(this));
      this.itemsPerPage = this.global.getPaginatedItems(this.allItems, this.page, this.pageSize);
      this.currentItems = _.concat(this.currentItems, this.itemsPerPage.data);

      this.hideSpinner();
    }
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
  /**
   * The view loaded, let's query our items for the list
   */
  ionViewDidLoad() {
  }

  /**
   * Prompt the user to add a new item. This shows our ItemCreatePage in a
   * modal and then adds the new item to our data source if the user created one.
   */
  addItem() {
    let addModal = this.modalCtrl.create('ItemCreatePage');
    addModal.onDidDismiss(item => {
      if (item) {
        this.items.add(item);
      }
    })
    addModal.present();
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

  /**
   * Delete an item from the list of items.
   */
  deleteItem(item) {
    this.items.delete(item);
  }

  /**
   * Navigate to the detail page for this item.
   */

  onChange(value) {
    // if (value == "All")
    //   this.currentItems = this.allItems;
    // else if (value == "rejected")
    //   this.currentItems = this.allItems.filter(item => item.Ebeln == value);
    // else if (value == "approved")
    //   this.currentItems = this.allItems.filter(item => item.Status == "A");
    // else if (value == "pending")
    //   this.currentItems = this.allItems.filter(item => item.Status == "P");

    this.currentItems = this.allItems.filter(item => item.Ebeln.includes(value.value));
  }

  openItem(item: Item) {
    this.navCtrl.push('ItemDetailPage', {
      item: item
    });
  }
}

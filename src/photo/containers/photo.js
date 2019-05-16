import React, { Component } from 'react';
import {
	ActivityIndicator,
	Button,
	Clipboard,
	FlatList,
	Image,
	Share,
	StyleSheet,
	Text,
	ScrollView,
  View,
  SafeAreaView,
  Platform,
} from 'react-native';
import { ImagePicker,Constants, Location, Permissions, SQLite } from 'expo';
import uuid from 'uuid';
import firebase from '../../../config/firebase';
import Environment from '../../../config/environment';

const db = SQLite.openDatabase('db.db');


class Photo extends Component {
	state = {
		image: null,
		uploading: false,
    googleResponse: null,
    confidence: 0,
    confidence_min: 0.60,
    date: '',
    time: '',
    data_time: '',
    location: null,
    errorMessage: null,
    array: null,
    TruckPlate:'',
    TruckPlateOriginal: '',
    TruckPlateConfidence: 0,
    TruckPlateUntrusted: '',
    Kilometers: '',
    KilometersOriginal: '',
    KilometersConfidence:'',
    KilometersUntrusted: '',
    Unit: 'KMS',
    lat: '',
    long: '',
    Ubication: '',
    Type: 'start',
    Logo: 'Logo',
    addedByPhone: 'False',
    synchronized: 'False',
    showImage: true,
    showData: false,
    start: true,
    repeat: 0,
  };

  baseState = {
    date: '',
    time: '',
    data_time: '',
    location: null,
    errorMessage: null,
    array: null,
    TruckPlate:'',
    TruckPlateOriginal: '',
    TruckPlateConfidence: 0,
    TruckPlateUntrusted: '',
    Kilometers: '',
    KilometersOriginal: '',
    KilometersConfidence:'',
    KilometersUntrusted: '',
    Unit: 'KMS',
    lat: '',
    long: '',
    Ubication: '',
    //Type: 'start',
    Logo: 'Logo',
    addedByPhone: 'False',
    synchronized: 'False',
    Kilo: '',
    lati: '',
    longi: '',
    showImage: true,
    showData: false,
    //start: true,
  };
  
  
  
  componentWillMount() {
    if (Platform.OS === 'android' && !Constants.isDevice) {
      this.setState({
        errorMessage: 'Oops, this will not work on Sketch in an Android emulator. Try it on your device!',
      });
    } else {
      this._getLocationAsync();
    }
  }

	async componentDidMount() {
		await Permissions.askAsync(Permissions.CAMERA_ROLL);
    await Permissions.askAsync(Permissions.CAMERA);
    
    //this.update();

    db.transaction(tx => {
      tx.executeSql(
        'create table if not exists test (id_pic integer primary key not null, DataTime text, TruckPlate text, TruckPlateOriginal text, TruckPlateConfidence text, TruckPlateUntrusted text, Kilometers text, KilometersOriginal text, KilometersConfidence text, KilometersUntrusted text, Unit text, Location text, Type text, Logo text, addedByPhone text, synchronized text);'
        //'create table if not exists pic (id integer primary key not null, done int, value text);'
      );
    });   
    /*
    this.interval = setInterval(
      () => {
        subirafirebase = submitToFirebase();
      },
      40000
    );*/
  }
  
  _getLocationAsync = async () => {
    let { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== 'granted') {
      this.setState({
        errorMessage: 'Permission to access location was denied',
      });
    }

    let location = await Location.getCurrentPositionAsync({});
    this.setState({ location });
  };
  

	render() {
    let { image } = this.state;
    let text = 'Waiting..';
    if (this.state.errorMessage) {
      text = this.state.errorMessage;
    } else if (this.state.location) {
      this.state.lat = JSON.stringify(this.state.location.coords.latitude);
      this.baseState.lati = this.state.lat;
      this.state.long = JSON.stringify(this.state.location.coords.longitude);
      this.baseState.longi = this.state.lat;
    }
    // let googleResponseV;
    // let confidenceV;
    let dateV;
    let timeV;
    let data_timeV;
    let locationV;
    let arrayV;
    let ConfidenceV;
    let TruckPlateV;
    let TruckPlateOriginalV;
    let TruckPlateConfidenceV;
    let TruckPlateUntrustedV;
    let KilometersV;
    let KilometersOriginalV;
    let KilometersConfidenceV;
    let KilometersUntrustedV;
    let UnitV;
    let latV;
    let longV;
    let UbicationV;
    let TypeV;
    let LogoV;
    let addedByPhoneV;
    let synchronizedV;
    let repeatV;

    //=====================DATA_TIME====================
    var today = new Date();
    this.state.date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    this.state.time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    //=====================DATA_TIME====================
  
		return (
      <View style={styles.container}>
				<ScrollView
					style={styles.container}
					contentContainerStyle={styles.contentContainer}
        >
          <View style={styles.helpContainer}>
            <View style={styles.getStartedContainer}>
              {image ? null : (
                <Text style={styles.getStartedText}>Bienvenido</Text>
              )}
            </View>
            {image ? null : (
              <Button onPress={this._pickImage} title="Iniciar viaje" />
            )}
              {this.state.googleResponse && this.state.repeat != 1  && this.state.showData == false &&(     
              <View style={styles.getStartedContainer}>
                <Text style={styles.getStartedText}>Gracias los valores de tu viaje han sido almacenados</Text>
                <Text>{this.baseState.Kilo} KMS</Text>
                <Text>LAT: {this.baseState.lati} LONG: {this.baseState.longi}</Text>
                <Button  
                  onPress={this._changeData}
                  title="Aceptar" />
              </View>    
            )}
						{this._maybeRenderImage()}
            {this._maybeRenderUploadingOverlay()}
          </View>
        </ScrollView>
      </View>
    );
	}



	_maybeRenderUploadingOverlay = () => {
		if (this.state.uploading) {
			return (
				<View
					style={[
						StyleSheet.absoluteFill,
						{
							backgroundColor: 'rgba(0,0,0,0.4)',
							alignItems: 'center',
							justifyContent: 'center'
						}
					]}
				>
					<ActivityIndicator color="#fff" animating size="large" />
				</View>
			);
		}
	};

	_maybeRenderImage = () => {
		let { image, googleResponse } = this.state;
		if (!image) {
			return;
		}

		return (
			<View style={styles.container}>
      {this.state.showData == true && this.state.start == false && (  
        <View style={styles.getStartedContainer}>
          <Text style={styles.getStartedText}>Estos son los datos de tu Viaje</Text>
          <Text>KMS: {this.baseState.Kilo} </Text>
          <Text>LAT: {this.baseState.lati} </Text>
          <Text>LONG: {this.baseState.longi}</Text>
          <Button onPress={this._pickImage} title="Finalizar Viaje" />
        </View>    
      )}
      <View style={styles.getStartedContainer}>
				{this.state.confidence != 0 && this.state.confidence < this.state.confidence_min && (
          <View>
            <Text style={styles.getStartedText}>Podrias tomar nuevamente la foto</Text>
            <Text>Creemos que los datos no son correctos, ¿Puedes tomar nuevamente la foto?</Text>
          </View>
        )}
        

        {this.state.confidence != 0 && this.state.confidence < this.state.confidence_min && (
          <Button onPress={this._pickImage} title="Tomar Foto" />
        )}
      </View>

      </View>
      
		);
	};

	// _keyExtractor = (item, index) => item.id;

	// _renderItem = item => {
  //   <Text>response: {JSON.stringify(item)}</Text>;
  //   console.log(JSON.stringify())
	// };

	_share = () => {
		Share.share({
			message: JSON.stringify(this.state.googleResponse.responses),
			title: 'Check it out',
			url: this.state.image
		});
	};

	_copyToClipboard = () => {
		Clipboard.setString(this.state.image);
		alert('Copied to clipboard');
	};

	_takePhoto = async () => {
    //subirafirebase = await uploadToDatabase("000001","000002");
		let pickerResult = await ImagePicker.launchCameraAsync({
			allowsEditing: true,
			aspect: [4, 3]
		});

    this._handleImagePicked(pickerResult);
    //this.submitToGoogle();
	};

	_pickImage = async () => {
		let pickerResult = await ImagePicker.launchImageLibraryAsync({
			allowsEditing: true,
			aspect: [4, 3]
		});

    this._handleImagePicked(pickerResult);
	};

	_handleImagePicked = async pickerResult => {
		try {
			this.setState({ uploading: true });

			if (!pickerResult.cancelled) {
        uploadUrl = await uploadImageAsync(pickerResult.uri);
				this.setState({ image: uploadUrl });
			}
		} catch (e) {
			console.log(e);
			alert('Upload failed, sorry :(');
		} finally {
			this.setState({ uploading: false });
    }
    
    this.submitToGoogle();
  };
 
  //Cambia estado de contendor de image
  _changeShow = () => {
    this.setState({
      showImage: !this.state.showImage
    });
  
  }

  //Cambia estado contenedor muestra datos del viaje
  _changeData = () => {
    if (this.state.start){
      this.setState({
        showData: !this.state.showData,
        Type: 'end',
        start: false
      });
      console.log('final')
    }else if(!this.state.start){
      this.setState(this.baseState);
      this.setState({ 
        image: null,
        uploading: false,
        googleResponse: null, 
        start: true,
      });
      
      console.log('inicio')
    }
  }

	submitToGoogle = async () => {
		try {
			this.setState({ uploading: true,});
			let { image } = this.state;
			let body = JSON.stringify({
				requests: [
					{
						features: [
							// { type: 'LABEL_DETECTION', maxResults: 10 },
							// { type: 'LANDMARK_DETECTION', maxResults: 5 },
							// { type: 'FACE_DETECTION', maxResults: 5 },
							// { type: 'LOGO_DETECTION', maxResults: 5 },
							// { type: 'TEXT_DETECTION', maxResults: 5 },
							{ type: 'DOCUMENT_TEXT_DETECTION', maxResults: 10 },
							// { type: 'SAFE_SEARCH_DETECTION', maxResults: 5 },
							// { type: 'IMAGE_PROPERTIES', maxResults: 5 },
							// { type: 'CROP_HINTS', maxResults: 5 },
							// { type: 'WEB_DETECTION', maxResults: 5 }
						],
						image: {
							source: {
								imageUri: image
							}
						}
					}
				]
			});
			let response = await fetch(
				'https://vision.googleapis.com/v1/images:annotate?key=' +
					Environment['GOOGLE_CLOUD_VISION_API_KEY'],
				{
					headers: {
						Accept: 'application/json',
						'Content-Type': 'application/json'
					},
					method: 'POST',
					body: body
				}
			);
			let responseJson = await response.json();
      //console.log(responseJson);
      //console.log(responseJson.responses[0].fullTextAnnotation.pages[0].blocks[0].confidence);
      this.setState({
				googleResponse: responseJson,
        uploading: false,
        confidence: responseJson.responses[0].fullTextAnnotation.pages[0].blocks[0].confidence,
        array: responseJson.responses[0].textAnnotations,
        kilometersbegin: 0,
        kilometersend: 0
      });

      this._changeShow()
      //console.log(this.state.googleResponse);
      //=====================Confidence============================
      ConfidenceV = this.state.confidence;
      //=====================Confidence============================

      //=====================Coords================================
      this._getLocationAsync()
      if (this.state.errorMessage) {
        text = this.state.errorMessage;
      } else if (this.state.location) {
        this.state.lat = JSON.stringify(this.state.location.coords.latitude);
        this.baseState.lati = this.state.lat;
        this.state.long = JSON.stringify(this.state.location.coords.longitude);
        this.baseState.longi = this.state.lat;
      }
      //=====================Coords================================

      //=====================DATATIME================================
      this.state.data_time = this.state.data_time.concat(this.state.date,' ', this.state.time)
      console.log(this.state.data_time);
      data_timeV = this.state.data_time;
      //=====================DATATIME================================
      //=====================TruckPlateOriginal======================
      let palabra = 'PLACA'
      var arreglo = [];
      var text = this.state.array[0]["description"];
      console.log("texto sin modificar: "+text);
      text=text.toLowerCase();
      text=text.replace(/ /g,"");
      text=text.replace(/paraestarseguro/g,"");
      text=text.replace(/...paraestarseguro/g,"");
      text=text.replace(/paraestarseg0r0/g,"");
      text=text.replace(/...paraestarseg0r0/g,"");
      text=text.replace(/\./g,"");
      text=text.replace(/,/g,"");
      text=text.replace(/ /g,'');
      text=text.replace(/\\/g,"");
      text=text.replace(/\n/g,",");
      text=text.replace(/o/g,"0");
      text=text.replace(/u/g,"0");


      var text = text.substring(
        text.lastIndexOf("placa") + 5, 
        text.lastIndexOf(",kms")
      );
      text=text.replace(/,,/g,",");
      textPlateAndKms = text.split(",");
        

      console.log("texto modificado: "+text);
      
      
      for (let i =0; i < this.state.array.length; i++ ){
        arreglo.push(this.state.array[i].description);
      }
      console.log(arreglo.indexOf(palabra));
      var positionPlaca = arreglo.indexOf(palabra);
      this.state.TruckPlateOriginal = this.state.TruckPlateOriginal.concat(arreglo[positionPlaca + 1], arreglo[positionPlaca + 2], arreglo[positionPlaca + 3]); 
      console.log(this.state.TruckPlateOriginal);
      TruckPlateOriginalV = this.state.TruckPlateOriginal;
      //=====================TruckPlateOriginal========================
      //=====================TruckPlate================================
      this.state.TruckPlate = this.state.TruckPlateOriginal;
      TruckPlateV = this.state.TruckPlate;
      //=====================TruckPlate================================

      //=====================TruckPlateConfidence======================
      this.state.TruckPlateConfidence = this.state.confidence;
      console.log(this.state.confidence);
      TruckPlateConfidenceV = this.state.TruckPlateConfidence;
      //=====================TruckPlateConfidence======================
      //=====================TruckPlateUntrusted=======================
      this.state.TruckPlateUntrusted = 'TRUE';
      console.log(this.state.TruckPlateUntrusted);
      TruckPlateUntrustedV = this.state.TruckPlateUntrusted;
      //=====================TruckPlateUntrusted=======================

      //=====================KilometersOriginal========================
      //this.state.kms = arreglo[positionPlaca + 4]; 
      var foo = '';
      KilometersOriginalV = 0;
      if(textPlateAndKms[1] === 'undefined' || textPlateAndKms[1] === undefined) {
        this.baseState.Kilo = 0;
        this.state.confidence = 0.10;
      }else{
        KilometersOriginalV = textPlateAndKms[1];
        KilometersOriginalV=KilometersOriginalV.replace(/i/g,'1');
        KilometersOriginalV=KilometersOriginalV.replace(/e/g,'3');
        KilometersOriginalV=KilometersOriginalV.replace(/t/g,'7');
        KilometersOriginalV=KilometersOriginalV.replace(/a/g,'4');
        KilometersOriginalV=KilometersOriginalV.replace(/s/g,'5');
        KilometersOriginalV=KilometersOriginalV.replace(/b/g,'8');
        if (typeof num1 != 'number'){
          this.state.confidence = 0.10;
        }else if(isNaN(KilometersOriginalV)){
          this.state.confidence = 0.10;
        }else if(parseInt(KilometersOriginalV) > 0){
          KilometersOriginalV = parseInt(KilometersOriginalV);
        }else{
          this.state.confidence = 0.10;
        }
        
          if(this.state.start){
            this.state.kilometersbegin = KilometersOriginalV
          }else {
            this.state.kilometersend = KilometersOriginalV
          }
        this.baseState.Kilo = KilometersOriginalV;
      }
      



      /*for (let j = positionPlaca + 4; j < positionPlaca + 10 ; j++)
      {
        var num = arreglo[j];
        parseInt(num);
        var digito;
        console.log(num);
        if (/^([0-100])*$/.test(num))
        {
          digito = num;
        }else{
          digito = arreglo[j];
        }
          this.state.KilometersOriginal = this.state.KilometersOriginal.concat(foo, digito);
          console.log(this.state.KilometersOriginal);
          KilometersOriginalV = this.state.KilometersOriginal;
          this.baseState.Kilo = KilometersOriginalV;
      }*/
      //=====================KilometersOriginal========================
      //=====================Kilometers================================
      this.state.Kilometers = this.state.KilometersOriginal;
      console.log(this.state.Kilometers);
      KilometersV = this.state.Kilometers;
      //=====================Kilometers================================
      //=====================KilometersConfidence======================
      this.state.KilometersConfidence = this.state.confidence;
      console.log(this.state.KilometersConfidence);
      KilometersConfidenceV = this.state.KilometersConfidence;
      //=====================KilometersConfidence======================
      //=====================KilometersUntrusted=======================
      this.state.KilometersUntrusted = 'TRUE';
      console.log(this.state.KilometersUntrusted);
      KilometersUntrustedV = this.state.KilometersUntrusted;
      //=====================KilometersUntrusted=======================
      //=====================Unit======================================
      UnitV = this.state.Unit;
      //=====================Unit======================================
      //=====================LOCATION==================================
      this.state.Ubication = this.state.Ubication.concat(this.state.lat,', ', this.state.long)
      console.log(this.state.Ubication);
      UbicationV = this.state.Ubication;
      this.baseState.lati = this.state.lat;
      this.baseState.longi = this.state.long;
      //=====================Ubication==================================
      //=====================Type=======================================
      // if(this.state.confidence > 0 && this.state.confidence > this.state.confidence_min)
      // {
      //   this.state.type = 'end';
      // }
      // console.log(this.state.type)
      TypeV = this.state.Type;
      //=====================Type=======================================
      //=====================Logo=======================================
      LogoV = this.state.Logo;
      //=====================Logo=======================================
      //=====================addedByPhone===============================
      addedByPhoneV = this.state.addedByPhone;
      //=====================addedByPhone===============================
      //=====================synchronized===============================
      synchronizedV = this.state.synchronized;
      //=====================synchronized===============================
      if (this.state.confidence < this.state.confidence_min){
        if(this.state.repeat == 0){
          this.setState({ repeat: 1,});
          repeatV = this.state.repeat;
        }else if(this.state.repeat == 1){
          this.setState({ repeat: 2,});
          repeatV = this.state.repeat;
        } 
      }

      this.setState(this.baseState);

      if(ConfidenceV > this.state.confidence_min || repeatV == 0 || repeatV == 2){
        db.transaction(
          tx => {
            tx.executeSql('insert into test (DataTime,TruckPlate, TruckPlateOriginal, TruckPlateConfidence, TruckPlateUntrusted, Kilometers, KilometersOriginal, KilometersConfidence, KilometersUntrusted, Unit, Location, Type, Logo, addedByPhone, synchronized) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)', [data_timeV, TruckPlateV, TruckPlateOriginalV, TruckPlateConfidenceV, TruckPlateUntrustedV, KilometersV, KilometersOriginalV, KilometersConfidenceV, KilometersUntrustedV, UnitV, UbicationV, TypeV, LogoV, addedByPhoneV, synchronizedV]);
            tx.executeSql('select * from test', [], (_, { rows }) =>
              console.log(JSON.stringify(rows))
            );
          },
        );
        subirafirebase = await uploadToDatabase(data_timeV, TruckPlateV, TruckPlateOriginalV, TruckPlateConfidenceV, TruckPlateUntrustedV, KilometersV, KilometersOriginalV, KilometersConfidenceV, KilometersUntrustedV, UnitV, UbicationV, TypeV, LogoV, addedByPhoneV,
          );
        this.setState({ repeat: 0,});
        this.setState({ Type: 'start',});
        // console.log(this.state);
        // console.log(this.baseState);
        // console.log(this.baseState.showImage);
      }
		} catch (error) {
			console.log(error);
    }
  };
}



async function uploadImageAsync(uri) {
	const blob = await new Promise((resolve, reject) => {
		const xhr = new XMLHttpRequest();
		xhr.onload = function() {
			resolve(xhr.response);
		};
		xhr.onerror = function(e) {
			console.log(e);
			reject(new TypeError('Network request failed'));
		};
		xhr.responseType = 'blob';
		xhr.open('GET', uri, true);
		xhr.send(null);
	});

	const ref = firebase
		.storage()
		.ref()
		.child(uuid.v4());
	const snapshot = await ref.put(blob);

	blob.close();

	return await snapshot.ref.getDownloadURL();
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
    backgroundColor: '#fff',
		paddingBottom: 10
	},
	developmentModeText: {
		marginBottom: 20,
		color: 'rgba(0,0,0,0.4)',
		fontSize: 14,
		lineHeight: 19,
		textAlign: 'center'
	},
	contentContainer: {
		paddingTop: 30
	},

	getStartedContainer: {
		alignItems: 'center',
		marginHorizontal: 50
	},

	getStartedText: {
    marginTop: '100%',
		fontSize: 24,
		color: 'rgba(96,100,109, 1)',
		lineHeight: 24,
		textAlign: 'center'
	},

	helpContainer: {
		marginTop: 15,
		alignItems: 'center'
	}
});

async function uploadToDatabase(
  DataTime,
  TruckPlate,
  TruckPlateOriginal,
  TruckPlateConfidence,
  TruckPlateUntrusted,
  Kilometers,
  KilometersOriginal,
  KilometersConfidence,
  KilometersUntrusted,
  Unit,
  Location,
  Type,
  Logo,
  addedByPhone,
  ) {
      firebase.database().ref('Viajes/').push({
        DataTime,
        TruckPlate,
        TruckPlateOriginal,
        TruckPlateConfidence,
        TruckPlateUntrusted,
        Kilometers,
        KilometersOriginal,
        KilometersConfidence,
        KilometersUntrusted,
        Unit,
        Location,
        Type,
        Logo,
        addedByPhone,
    }).then((data)=>{
        //success callback
        console.log('data ' , data)
        return data;
    }).catch((error)=>{
        //error callback
        console.log('error ' , error)
        return error;
    })

}

async function submitToFirebase() {
  var database = firebase.database();
  console.log('### EJECUTANDO SINCRONIZACIÓN ###');
  try {
    db.transaction(tx => {
      tx.executeSql('select * from test WHERE synchronized=?', ['False'], (_, { rows }) =>
      {
        
        for(x=0;x<rows.length;x++)  {
          let ele = rows._array[x];
          database.ref('/Trip').push({
            DateTime:ele.DataTime,
            Kilometers:ele.Kilometers,
            KilometersConfidence:ele.KilometersConfidence,
            KilometersOriginal:ele.KilometersOriginal,
            KilometersUntrusted:ele.KilometersUntrusted,
            Location:ele.Location,
            Logo:ele.Logo,
            PicURL:'',
            TruckPlate:ele.TruckPlate,
            TruckPlateConfidence:ele.TruckPlateConfidence,
            TruckPlateOriginal:ele.TruckPlateOriginal,
            TruckPlateUntrusted:ele.TruckPlateUntrusted,
            Type:ele.Type,
            Unit:ele.Unit,
            addedByPhone:ele.addedByPhone
          }).then((data)=>{
              
              db.transaction(function (tx2) {
                tx2.executeSql('update test set synchronized=\'True\' where id_pic='+ele.id_pic, [], function(tx3, rs3){
                  });
              });
              console.log('enviado '+ele.id_pic);
          }).catch((error)=>{
              //error callback
              console.log('error ' , error)
          })
        }
      }
      );
    });
  } catch (error) {
    console.log(error);
  }
}

export default Photo;

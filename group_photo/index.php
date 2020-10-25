<html>

<head>
    <title>Group Photo</title>
    <style>
        body {
            background-color: #000000;
            margin: 0px;
            overflow: hidden;
        }

        #info {
            border-radius: 2px;
            margin-top: 10px;
            color:white;
            padding: 5px;
            width: 100% ;
            text-align: center;
            z-index: 1;
          
        }

        #hint {
            padding: 10;
            height: 30px;
            text-align: center;
            font-size: 32px;
            user-select: none;
        }

        #container {
            z-index: -1;
            position: absolute;
            color:white;
        }
    </style>

</head>
<meta name="viewport" content="width=device-width, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0">


<body>

    <!--These are the main divs for three.js -->
    <div id='container'></div>
    <div id='info'>
        <select id='video_select'> </select> 
        <div id='hint'  >Press Spacebar To Take For Live Video<BR>Arrows or W,A,S,D Keys To Position (No Social Distance Necessary)</div>

        <!--<div id='output'>Lost</div>--> 
    </div>

    <?php 

    	$realUser =	 $_SERVER['REDIRECT_REMOTE_USER']; 
		$realUser = substr($realUser, 0, strpos($realUser,"@"));
		if (empty($realUser)){
		    $realUser = $_SERVER['PHP_AUTH_USER'];
			
        }
        $address =  $_SERVER['REMOTE_ADDR']  . $_SERVER['REMOTE_PORT'];
     ?>
    <script>
           var netid = "<?php echo $realUser  ?>";
           var address = "<?php echo $address   ?>";
      
    </script>


    <!--Here all the p5, three.js, jquery, tensorflow(masking) libaries.  Coming from http CDN addresses allows us to share this code
    without sharing the files for the libaries-->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.1.9/p5.js"></script>
      <!-- <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.1.9/addons/p5.sound.min.js"></script>-->
    <script src="https://unpkg.com/ml5@0.4.3/dist/ml5.min.js"></script>
    <!--  <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/0.7.3/p5.min.js"></script> -->
       <!--  <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.1.9/p5.min.js" integrity="sha512-WIklPM6qPCIp6d3fSSr90j+1unQHUOoWDS4sdTiR8gxUTnyZ8S2Mr8e10sKKJ/bhJgpAa/qG068RDkg6fIlNFA==" crossorigin="anonymous"></script>-->
      <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/102/three.min.js"></script>

   <!--  <script src="https://unpkg.com/ml5@latest/dist/ml5.min.js" type="text/javascript"></script>   
 -->

    
   <script src="BodyPixP5.js"></script>

    <script src="//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js"></script>

    <!-- This is all of our local code
   <script src="BodyPixP5Instance.js"></script>

 -->

    <!-- Instead of having a separate js file the main javascript is added using script tags-->
    <script>
        ///ONLY DO THIS PART IF YOU WANT TO USE A SEPARATE USB CAMERA
        navigator.mediaDevices.enumerateDevices().then(function (d) {
            var select = document.getElementById('video_select');
            
            //select.setAttribute("id", "video_select");
            var option;
            option = document.createElement('option');
            option.value = d[0].deviceId;
            option.textContent = "Default Camera";
            select.appendChild(option);
            for (var i = 0; i < d.length; i++) {
               // console.log(d[i].kind);
                if (d[i].kind == "videoinput") {
                    option = document.createElement('option');
                    option.value = d[i].deviceId;
                    option.textContent = d[i].label;
                    select.appendChild(option);
                }
            }
          
           // $('#video_select').change(setVideoInput);
        });


        //usual 3D variables

        let scene;
        let camera3D;
        let renderer;
        let distanceFromCenter = 930;
        let delayOnSendingPosition ;

        let myID;
        let myPositionOnCircle = 0.0;
        let myPositionOnCircleV = 0.0;
        let myZOffset = 0;

        let allClients = [];
        let mirrorTexture;
        let mirror;
        let firstImage = false;
        let existingImageURL;
      

        //like draw
        var animate = function () {
            //recursively call this function is a way that the renderer does it in a smart way
            requestAnimationFrame(animate);
            renderer.render(scene, camera3D);

            for (var key in allClients) {
                allClients[key].animateThings();
            }
            if (mirrorTexture) 
                mirrorTexture.needsUpdate = true;
   
            renderer.render(scene, camera3D);
        };

        //like setup
        function init() {
            console.log("initializing three.js")
            basic3DStuff()
            activatePanoControl(camera3D); //field mouse dragggin to move camera
            doWebSocketStuff();
            createPanoramicBackgroundInThreeJS();
        }

        init();  //like setup but you have to call it yourself
        animate();  //like draw you have to kick start and then it calls itself



        function createP5BodyPixInstance(){
            console.log("before");
            let sketchInstance = new p5(BodyPixSketch);  //this name is in your sketch
           console.log(sketchInstance );
            let sketchCanvas =   sketchInstance.getP5Canvas();
            //let front = getCoordsInFrontOfCamera();
            loadP5Sketch(sketchCanvas,0,0,0);  
            //loadP5Sketch(sketchCanvas,front.x,front.y,front.z); 
            
        }


        function gotBodyPixImage() {
            //update the face in scene
            if (mirrorTexture) {
                mirrorTexture.needsUpdate = true;
                mirror.lookAt(camera3D.position.x, camera3D.position.y, camera3D.position.z);
            }
            if (firstImage == false){
                firstImage = true;
              //  sendImage();
            }
        }

        //repositions the camera which represents me, not the mirror
        function repositionMe() {
            lon = myPositionOnCircle;
            lat = myPositionOnCircleV;
            computeCameraOrientation();
            if (mirror) {  //race condition bodypx happened first
                let pos= newGetPositionOnCircle(myPositionOnCircle,myPositionOnCircleV, distanceFromCenter + myZOffset);
                mirror.position.set(pos.x, pos.y, pos.z);
            }
        }

        function newGetPositionOnCircle(angleH, angleV,radius){
            let  v = THREE.Math.degToRad(90 - angleV);
            let h = THREE.Math.degToRad(angleH);
            x = distanceFromCenter * Math.sin(v) * Math.cos(h);
            y = distanceFromCenter  * Math.cos(v);
            z = distanceFromCenter  * Math.sin(v) * Math.sin(h);
            return { "x": x, "z": z , "y": y};
        }

        function createPanoramicBackgroundInThreeJS() {
            //create a sphere to put the panoramic image (can be video) on it
            var geometry = new THREE.SphereGeometry(1000, 60, 40);
            //var geometry = new THREE.CylinderGeometry(725, 725, 1000, 10, 10, true)
            //  var geometry = new THREE.CylinderGeometry(500, 60, 40);
            geometry.scale(-1, 1, 1);
            //  (8192x4096).  i think it goes upside down because texture is not right size
            panotexture = new THREE.TextureLoader().load('./pano/PANO_HallwaySphereFlipGreySmall.jpg');
            var material = new THREE.MeshBasicMaterial({ map: panotexture, transparent: true,   alphaTest: 0.02,opacity: 0.3});
            var mesh = new THREE.Mesh(geometry, material);
            scene.add(mesh);
        }

        function basic3DStuff() {
            console.log("adding 3D stuff")
            //all three.js programs have a scene, a camera and a renderer
            scene = new THREE.Scene();
            scene.background = new THREE.Color( 0xdddddd );
            camera3D = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            renderer = new THREE.WebGLRenderer();
            renderer.setSize(window.innerWidth, window.innerHeight);
            camera3D.position.z = 0;

            //this puts the three.js stuff in a particular div
            document.getElementById('container').appendChild(renderer.domElement);

            //add some lights if you want
            var ambient = new THREE.HemisphereLight(0xbbbbff, 0x886666, 0.85);
            ambient.position.set(-0.5, 0.75, -1);
            scene.add(ambient);

            var light = new THREE.DirectionalLight(0xffffff, 0.85);
            light.position.set(1, 0.75, 0.5);
            scene.add(light);
        }


        //you have to call this in your other code eg P5Sketch if not an instance
        function loadP5Sketch(p5_canvas, x, y, z) {
            ////PUT IN A P5 SKETCH USING THE CANVAS MADE IN P5 AS A TEXTURE
            let geo = new THREE.PlaneGeometry(512,256);
            mirrorTexture = new THREE.Texture(p5_canvas);
            let mat = new THREE.MeshBasicMaterial({ map: mirrorTexture, transparent: false, side: THREE.DoubleSide });
            mat.alphaTest = 0.5
            mirror = new THREE.Mesh(geo, mat);
            scene.add(mirror);
            var pos = newGetPositionOnCircle( myPositionOnCircle, myPositionOnCircleV,  distanceFromCenter  +10);
            mirror.position.set(pos.x, pos.y, pos.z);
            mirror.name = 'mirror';
        }

        //////////////////////////////////////////////////////////////
        //OBJECT ORIENTED CLASS FOR KEEPING TRACK OF ALL CLIENTS FOR SERVER
        //////////////////////////////////////////////////////////////
        class Client {

            constructor(msg) {
                //console.log("New Client" , msg)
                this.ID = msg.ID;
                this.things = [];
                this.canvas = document.createElement("CANVAS"); 
                this.canvas.width = 512;
                this.canvas.height = 256;
                this.ctx =  this.canvas.getContext('2d');
                this.positionOnCircle = msg.positionOnCircle;
                this.positionOnCircleV = msg.positionOnCircleV;
                this.zOffset = msg.zOffset;
                this.img;
                var geo = new THREE.PlaneGeometry(512, 256);
                this.texture = new THREE.Texture(this.canvas);
                let mat = new THREE.MeshBasicMaterial({ map: this.texture, transparent: false, side: THREE.DoubleSide });
                mat.alphaTest = 0.5
                this.avatarObj = new THREE.Mesh(geo, mat);
                scene.add(this.avatarObj);
                var pos = newGetPositionOnCircle(this.positionOnCircle, this.positionOnCircleV, distanceFromCenter + this.zOffset );
                this.avatarObj.position.x = pos.x;
                this.avatarObj.position.z = pos.z;
                this.avatarObj.position.y = pos.y;
                this.avatarObj.lookAt(camera3D.position.x, camera3D.position.y, camera3D.position.z);
                this.newImage(msg);
            }


            newImage(msg) {
                this.img = new Image();
                this.img.crossOrigin = "anonymous";
                this.img.src = 'https://itp.nyu.edu/group/images/' + this.ID + ".png?" + performance.now();
                //console.log( this.img.src);
                this.loadObjectImage(this, this.img,  this.ctx);
            }

            loadObjectImage(whichClient, img, ctx) {
                img.onerror = function() {
                    console.log("Error occurred while loading image for " + whichClient);
                };
                img.onload = function () {
                    ctx.drawImage(img, 0, 0,512,256);
                     console.log("loaded" );
                    whichClient.texture.needsUpdate = true;
                };
            }

            newPosition(msg) {
                this.positionOnCircle = msg.positionOnCircle;
                var pos = newGetPositionOnCircle(this.positionOnCircle, this.positionOnCircleV,distanceFromCenter );
                this.avatarObj.position.x = pos.x;
                this.avatarObj.position.z = pos.z;
                this.avatarObj.position.y = pos.y;
            }

            animateThings() {
                this.avatarObj.lookAt(camera3D.position.x, camera3D.position.y, camera3D.position.z);
                this.texture.needsUpdate = true;
            }

            //leave() {
            //    scene.remove(this.cube);
            //}

        }


        //////////////////////////////////////////////////////////////
        //WEBSOCKETS
        //////////////////////////////////////////////////////////////
        var connection;

        function doWebSocketStuff() {
            // if user is running mozilla then use it's built-in WebSocket
            window.WebSocket = window.WebSocket || window.MozWebSocket;
            // if browser doesn't support WebSocket, just show some notification and exit
            if (!window.WebSocket) {
                console.log('Sorry, but your browser doesn\'t '
                    + 'support WebSockets.');
                return;
            }
            // open connection
            connection = new WebSocket('wss://dano.itp.io:1337?unique=' +netid + "&address=" + address);
         //   connection = new WebSocket('ws://dano.itp.io:1337');
            //connection = new WebSocket('ws://161.35.109.160:1337');
            //connection = new WebSocket('ws://127.0.0.1:1337');
            connection.onopen = function () {
                //  any start up events.  usually you pick name but we are using timestamp
            };
            connection.onerror = function (error) {
                console.log('Sorry, but there\'s some problem with your '
                    + 'connection or the server is down.');
            };
            // most important part - incoming messages
            connection.onmessage = function (message) {
                try {
                    var json = JSON.parse(message.data);
                } catch (e) {
                    console.log('This doesn\'t look like a valid JSON: ', message.data);
                    return;
                }
                gotMessage(json);
            };
            connection.onclose = function (evt) {
                console.log(evt);
            };
        }

        function sendPosition() {
            var myJSON = {};
            myJSON.ID = myID;
            myJSON.positionOnCircle = myPositionOnCircle;
            myJSON.positionOnCircleV = myPositionOnCircleV;
            myJSON.zOffset = myZOffset;
            myJSON.type = "position";
            if (connection)
                connection.send(JSON.stringify(myJSON));
        }

        function sendText(text) {
            var myJSON = {};
            myJSON.ID = myID;
            myJSON.text = text;
            myJSON.type = "text";
            if (connection)
                connection.send(JSON.stringify(myJSON));
        }

        function sendImage() {
            //console.log(myJSON.image); 
            $.ajax({
                type: "POST",

                url: "https://itp.nyu.edu/group/upload.php",
                data: {
                    imgBase64: getVideoImage(),
                    filename: myID + ".png"
                }
            }).done(function (e) {
                //console.log("Got Back from Upload Script " + e + " vpos" + myPositionOnCircleV);

                if (connection) {
                    var myJSON = {};
                    myJSON.ID = myID;
                    myJSON.positionOnCircle = myPositionOnCircle;
                    myJSON.positionOnCircleV = myPositionOnCircleV;
                    myJSON.zOffset = myZOffset;
                    myJSON.type = "pic";
                    connection.send(JSON.stringify(myJSON));
                }
            }) .fail(function(xhr, status, error) {
                console.log(xhr, status, error)
            });;
        }

        function gotMessage(json) {
            
            if (json.type === 'initial') { // first response from the server with user's ID (using time)
                console.log(json);
                myID = json.contents.ID;
               
                console.log("got ID " + myID + "got positionOnCircle " + json.contents.positionOnCircle + " " + json.contents.positionOnCircleV );
                myPositionOnCircle = json.contents.positionOnCircle;
                myPositionOnCircleV = json.contents.positionOnCircleV;
                myZOffset = json.contents.zOffset; 
               // myPositionOnCircleZ = json.contents.positionOnCircleZ;
                
                //createP5BodyPixInstance();
                repositionMe();
                let  allHistory =  JSON.parse(json.contents.history);
                //console.log(allHistory);
                for (id in allHistory ) {
                    let thisMessage = allHistory[id];
                    if (thisMessage.positionOnCircleV == null) thisMessage.positionOnCircleV =0;
                   // console.log(thisMessage);
                    tellClient(thisMessage , "message")
                }
            } else if (json.type === 'pic') { // it's a single message
                let messageContent = JSON.parse(json.contents.utf8Data);
                tellClient(messageContent, "pic");
            } else if (json.type === 'position') { // it's a single message
                let messageContent = JSON.parse(json.contents.utf8Data);
                tellClient(messageContent, "position")
            } else {
                console.log('Hmm..., I\'ve never seen JSON like this: ', json);
            }
        }

        /**
         * Deal with the message
         */
        function tellClient(msg, type) {
            if (msg.ID == myID) {
                if (msg.type == "history"){
                   existingImageURL = 'https://itp.nyu.edu/group/images/' + myID + ".png?" + performance.now();
                //   setImage(existingImageURL);
                    console.log("pic from me" + existingImageURL);
                    
                }
                return;  //don't bother if this is message from me
                
            }
            let thisClient = allClients[msg.ID];
            if (thisClient == null) {//if it does not exist
                allClients[msg.ID] = new Client(msg);  //add a new client
                thisClient = allClients[msg.ID];
            }
            if (type == "pic") {
                thisClient.newImage(msg);
            } else if (type == "position") {
                thisClient.newPosition(msg);
            }
        }

        //checks against the list of grabbableMeshes for what you have clicked on to make it the "selectedObject"
        // function onDocumentMouseDownCheckObject(e) {
        //    checkIfOverObject((event.clientX / renderer.domElement.clientWidth) * 2 - 1, -(event.clientY / renderer.domElement.clientHeight) * 2 + 1);
        // }

        //this uses a er to project 3D intersection points from 2D coordinate from mouse or poseNet
        //not the x and y are pos and neg numbers between 0-1 representing distance from center of screen not for example 0-640
      /*  function checkIfOverObject(x, y) {
            // console.log(selectableMeshes);
            // console.log(x,y);
            var raycaster = new THREE.Raycaster(); // create once
            var mouse = new THREE.Vector2(); // create once
            mouse.x = x;
            mouse.y = y;
            raycaster.setFromCamera(mouse, camera3D);
            var intersects = raycaster.intersectObjects(mirror, true);
            if (intersects.length > 0) {
                return true;
            } else {
                return false;
            }

        }*/



        var onMouseDownMouseX = 0, onMouseDownMouseY = 0;
        var onPointerDownPointerX = 0, onPointerDownPointerY = 0;
        var lon = 0, onMouseDownLon = 0, lat = 0, onMouseDownLat = 0, phi = 0, theta = 0;
        var isUserInteracting = false;
        var myCamera;

        function activatePanoControl(cam) {
            myCamera = cam;  //passing the camera to a variable here makes it easier to reuse this file
            document.addEventListener('keydown', onDocumentKeyDown, false);
            document.addEventListener('mousedown', onDocumentMouseDown, false);
            document.addEventListener('mousemove', onDocumentMouseMove, false);
            document.addEventListener('mouseup', onDocumentMouseUp, false);
            document.addEventListener('wheel', onDocumentMouseWheel, false);

            myCamera.target = new THREE.Vector3(0, 0, 0);

            // Listen for window resize
            window.addEventListener('resize', onWindowResize, false);
        }

        function onDocumentKeyDown(event) {
            if (event.key == " ") {
                lon = myPositionOnCircle;
                computeCameraOrientation();
               if (isCapturing()){ 
                var timeleft = 3;
                $("#hint").html(timeleft);
                $('#hint').css('font-size', '120px');
                $('#hint').css('color', 'red');
                var downloadTimer = setInterval(function () {
                    if (timeleft <= 0) {
                        clearInterval(downloadTimer);
                        sendImage();
                        $('#hint').css('font-size', '24px');
                        $('#hint').css('color', 'white ');
                        $("#hint").html("Press  Spacebar to Get Live Video<BR>Arrows or W,A,S,D Keys To Position (No Social Distance Necessary)");
                        pauseVideo();
                    }else{
                        $("#hint").html(timeleft);
                    }
                    timeleft -= 1;
                }, 1000);

                }else{
                    restartVideo();
                    $("#hint").html("Press  Spacebar to Retake  Picture<BR>Arrows or W,A,S,D Keys To Position (No Social Distance Necessary)");
             }
        

            //
               
            }else{
                if ( event.key == "w" || event.keyCode == '38'){
                myPositionOnCircleV += 0.3;
            }else if ( event.key == "a" || event.keyCode == '37'){
                myPositionOnCircle -= 0.3;
            }else if ( event.key == "s" || event.keyCode == '40'){
                myPositionOnCircleV -= 0.3;
            }else if ( event.key == "d" || event.keyCode == '39'){
                myPositionOnCircle += 0.3;
            }
            clearTimeout(delayOnSendingPosition);
            delayOnSendingPosition = setTimeout(sendPosition, 2000);
            var pos = newGetPositionOnCircle( myPositionOnCircle, myPositionOnCircleV,  distanceFromCenter  + myZOffset );
            mirror.position.set(pos.x, pos.y, pos.z);
            mirror.lookAt(camera3D.position.x, camera3D.position.y, camera3D.position.z);
        }

        }
        function onDocumentMouseDown(event) {
            onPointerDownPointerX = event.clientX;
            onPointerDownPointerY = event.clientY;
            onPointerDownLon = lon;
            onPointerDownLat = lat;
            isUserInteracting = true;
        }

        function onDocumentMouseMove(event) {
            if (isUserInteracting) {
                lon = (onPointerDownPointerX - event.clientX) * 0.1 + onPointerDownLon;
                lat = (event.clientY - onPointerDownPointerY) * 0.1 + onPointerDownLat;
                computeCameraOrientation();
            }
        }

        function onDocumentMouseUp(event) {
            isUserInteracting = false;

        }

        function onDocumentMouseWheel(event) {
            myCamera.fov += event.deltaY * 0.05;
            myCamera.updateProjectionMatrix();
        }

        function computeCameraOrientation() {
            lat = Math.max(- 30, Math.min(30, lat));
            phi = THREE.Math.degToRad(90 - lat);
            theta = THREE.Math.degToRad(lon);
            myCamera.target.x = distanceFromCenter * Math.sin(phi) * Math.cos(theta);
            myCamera.target.y = distanceFromCenter  * Math.cos(phi);
            myCamera.target.z = distanceFromCenter  * Math.sin(phi) * Math.sin(theta);
            myCamera.lookAt(myCamera.target);
            //$("#output").html("Lon:" + lon);
            // console.log(lon,lat);
            /*
            // distortion
            camera3D.position.copy( camera3D.target ).negate();
            */

        }


        function onWindowResize() {
            myCamera.aspect = window.innerWidth / window.innerHeight;
            myCamera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
            console.log('Resized');
        }



    </script>
</body>

</html>
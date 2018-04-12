document.addEventListener( 'dragover', function ( event ) {
					event.preventDefault();
					//event.dataTransfer.dropEffect = 'all';

				}, false );
				document.addEventListener( 'dragenter', function ( event ) {
					// event.dataTransfer.setData("text", event.target.id);
					document.body.style.opacity = 0.5;
				}, false );
				document.addEventListener( 'dragleave', function ( event ) {
					document.body.style.opacity = 1;
				}, false );
				document.addEventListener( 'drop', function ( event ) {
					event.preventDefault();
          var data = event.dataTransfer.getData('text/html');
          //use a regular expression to pull the url out of the the html for the thing they dropped
          var regexToken = /(((http|https?):\/\/)[\-\w@:%_\+.~#?,&\/\/=]+)|((mailto:)?[_.\w-]+@([\w][\w\-]+\.)+[a-zA-Z]{2,3})/g;
          var url = regexToken.exec(data)[0]; //returns array of all matches but you want the first
          //Creat a new object using our own object function'
          var elementID = "OSC_IMG_"+ numberOfElements;
          newElement(elementID,url,mouseX,mouseY,-1,-1);

				//	reader.readAsDataURL( event.dataTransfer.files[ 0 ] );
					document.body.style.opacity = 1;
				}, false );

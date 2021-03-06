define(['jquery','backbone','underscore'],function($,Backbone,_){
	return Backbone.View.extend({
		initialize: function(params){
			var self = this;

			if(google.maps && google.maps.Map){
				if(params.center)
					self.setCenter(params.center.lat,params.center.lng);
				if(params.zoom)
					self.setZoom(params.zoom);

				self.markers = {};
				return self.render();
			}
			google.maps.event.addDomListener(window,'load',function(){
				if(params.center)
					self.setCenter(params.center.lat,params.center.lng);
				if(params.zoom)
					self.setZoom(params.zoom);

				self.markers = {};
				self.render();
			});
		},
		setCenter: function(lat,lng){
			
			this.center = new google.maps.LatLng(lat,lng);
			
			if(this.map)
				this.map.setCenter(this.center);	
		

		},
		setZoom: function(zoom){
			this.zoom = zoom;

			if(this.map)
				this.map.setZoom(this.zoom);
		},
		setupEvents:function(){
			var self = this;
			google.maps.event.addListener(self.map, "idle", function() {
  			self.trigger('idle',{bounds:self.getBounds()});
			});

			google.maps.event.addListener(self.map, "tilesloaded", function() {
  			self.trigger('tiles_loaded',{});
			});

		},
		getBounds: function(){
			var bounds = this.map.getBounds();
			var bottom_left = this.latlngToArray(bounds.getSouthWest());
			var upper_right = this.latlngToArray(bounds.getNorthEast());

			return [bottom_left,upper_right];
		},
		latlngToArray:function(latlng){
			var array = [];
			array[0] = latlng.lat();
			array[1] = latlng.lng();
			return array;
		},
		render: function(){
			this.map = new google.maps.Map(this.$el[0],{center:this.center,zoom:this.zoom});
			this.setupEvents();
		},
		renderMarkersLayer: function(properties){
			var self = this;

			_.each(self.markers,function(marker,key){
				marker.setMap(null);
				delete self.markers[key];
			});

			
			_.each(properties,function(property){
				var image = "";
				if(property.propertyType === "apartment")
					image = "/img/apt-marker.png"

				if(property.propertyType === "house")
					image = "/img/house-marker.png"

				var position = new google.maps.LatLng(property.loc[0],property.loc[1]);
				var marker = new google.maps.Marker({position:position,icon:image,propertyType:property.propertyType,title:property.title});
				marker.setMap(self.map);
				self.markers[property._id] = marker;
			});
		},
		setActiveMarker: function(e){
			var marker = this.markers[e.id]

			if(marker.propertyType == "apartment")
				marker.setIcon("/img/apt-marker-active.png")
			else
				marker.setIcon("/img/house-marker-active.png")
		},
		clearActiveMarker: function(e){
			var marker = this.markers[e.id]
			
			if(marker.propertyType == "apartment")
				marker.setIcon("/img/apt-marker.png")
			else
				marker.setIcon("/img/house-marker.png")
		},
		renderMarker: function(property){
			var image = "";
			if(property.propertyType === "apartment")
				image = "/img/apt-marker.png"

			if(property.propertyType === "house")
				image = "/img/house-marker.png"

			var position = new google.maps.LatLng(property.loc[0],property.loc[1]);
			var marker = new google.maps.Marker({position:position,icon:image,propertyType:property.propertyType,title:property.title});
			marker.setMap(this.map);
		},
		triggerResize: function(opts){
			google.maps.event.trigger(this.map, 'resize');
			this.setCenter(opts.lat,opts.lng);
		}
	});
});
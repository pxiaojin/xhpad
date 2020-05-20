function DrawVectorLayer(geojson_url) {
  const style = new ol.style.Style({
    fill: new ol.style.Fill({
      color: 'rgba(255, 255, 255, 1)'
    }),
    stroke: new ol.style.Stroke({
      color: '#777',
      width: 1
    }),
    text: new ol.style.Text({
      font: '12px Calibri,sans-serif',
      fill: new ol.style.Fill({
        color: '#000'
      }),
      stroke: new ol.style.Stroke({
        color: '#fff',
        width: 3
      })
    })
  });
  
  const vectorLayer = new ol.layer.Vector({
    source: new ol.source.Vector({
    	url: geojson_url,
//      url: '/images/countries.geojson',
//      url: '/images/world.json',
      format: new ol.format.GeoJSON()
    }),
    style: function(feature) {
      style.getText().setText(feature.get('name'));
      return style;
    }
  });

  const highlightStyle = new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: '#f00',
      width: 1
    }),
    fill: new ol.style.Fill({
      color: 'rgba(255,0,0,0.1)'
    }),
    text: new ol.style.Text({
      font: '12px Calibri,sans-serif',
      fill: new ol.style.Fill({
        color: '#000'
      }),
      stroke: new ol.style.Stroke({
        color: '#f00',
        width: 3
      })
    })
  });

  const featureOverlay = new ol.layer.Vector({
    source: new ol.source.Vector(),
    style: function(feature) {
      highlightStyle.getText().setText(feature.get('name'));
      return highlightStyle;
    }
  });

  let highlight;
//  const displayFeatureInfo = function(pixel) {
//
//    const feature = map.forEachFeatureAtPixel(pixel, function(feature) {
//      return feature;
//    });
//
//    const info = document.getElementById('info');
//    if (feature) {
//      info.innerHTML = feature.getId() + ': ' + feature.get('name');
//    } else {
//      info.innerHTML = '&nbsp;';
//    }
//
//    if (feature !== highlight) {
//      if (highlight) {
//        featureOverlay.getSource().removeFeature(highlight);
//      }
//      if (feature) {
//        featureOverlay.getSource().addFeature(feature);
//      }
//      highlight = feature;
//    }
//  };

//  map.on('pointermove', function(evt) {
//    if (evt.dragging) {
//      return;
//    }
//    const pixel = map.getEventPixel(evt.originalEvent);
//    displayFeatureInfo(pixel);
//  });

//  map.on('click', function(evt) {
//    displayFeatureInfo(evt.pixel);
//  });

  return vectorLayer;
}

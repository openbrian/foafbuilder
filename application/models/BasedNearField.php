<?php
require_once 'Field.php';
require_once 'helpers/Utils.php';
/*FIXME: perhaps fields shouldn't do the whole sparql query thing in the constructor.*/

/*class to represent one item e.g. foafName or bioBirthday... not the same as one triple*/
class BasedNearField extends Field {
	
    /*predicateUri is only appropriate for simple ones (one triple only)*/
    public function BasedNearField($foafData) {
        /*TODO MISCHA dump test to check if empty */
    	//TODO: add foaf:nearestAirport stuff
        if ($foafData->getPrimaryTopic()) {
        	
            $queryString = $this->getQueryString($foafData->getPrimaryTopic());
            $results = $foafData->getModel()->SparqlQuery($queryString);		

            //var_dump($results);
            
          	$this->data['basedNearFields'] = array();
			$this->data['basedNearFields']['basedNear'] = array();
				
            if($results && !empty($results)){
            	
	            /*mangle the results so that they can be easily rendered*/
	            foreach ($results as $row) {
	       
	            	$this->addBasedNearElements($row);

	            }	
            
        	}

            $this->data['basedNearFields']['displayLabel'] = "I'm based near...";
            $this->data['basedNearFields']['name'] = 'basedNear';
            $this->name = 'basedNear';
            $this->label = "I'm based near...";
    	}
    }

	
    /*saves the values created by the editor in value... as encoded in json.  Returns an array of bnodeids and random strings to be replaced by the view.*/
    public function saveToModel(&$foafData, $value) {
    	if(!isset($value->basedNear) || !$value->basedNear){
        	return;
    	}
    	/*array to keep track of bnode ids versus random strings generated by the UI*/
		$randomStringToBnodeArray = $foafData->getRandomStringToBnodeArray();
		$doNotCleanArray = array();
		
		foreach($value->basedNear as $basedNearName => $basedNearContents){
			
			/*find the triples associated with this account*/
			$foundModelLat = $foafData->getModel()->find(new BlankNode($basedNearName), new Resource('http://www.w3.org/2003/01/geo/wgs84_pos#lat'), NULL);
			$foundModelLong = $foafData->getModel()->find(new BlankNode($basedNearName), new Resource('http://www.w3.org/2003/01/geo/wgs84_pos#long'), NULL);
			$foundModelLatLong = $foafData->getModel()->find(new BlankNode($basedNearName), new Resource('http://www.w3.org/2003/01/geo/wgs84_pos#lat_long'), NULL);
				
			/*remove them*/
			foreach($foundModelLat->triples as $triple){
				$foafData->getModel()->remove($triple);
			}
			foreach($foundModelLong->triples as $triple){
				$foafData->getModel()->remove($triple);
			}
			foreach($foundModelLatLong->triples as $triple){
				$foafData->getModel()->remove($triple);
			}
				
			/*check whether we've already created this bnode or not*/
			if(strlen($basedNearName) == 50){		
	    		if(isset($randomStringToBnodeArray[$basedNearName])){
					
					$basedNearBnode = new BlankNode($randomStringToBnodeArray[$basedNearName]);
				} else {
					//XXX RAP doesn't seem to be very good at generating unique bnodes, so do some jiggery pokery
					//$holdsAccountBnode = new BlankNode($foafData->getModel());
					$basedNearBnode = Utils::GenerateUniqueBnode($foafData->getModel());
								
					//TODO: create an account triple here and add it to the model.  also set the bnode to be created.
					$basedNearStatement = new Statement(new Resource($foafData->getPrimaryTopic()),new Resource('http://xmlns.com/foaf/0.1/based_near'),$basedNearBnode);	
					$foafData->getModel()->add($basedNearStatement);
							
					/*so that we can keep track of what's going on*/
					$randomStringToBnodeArray[$basedNearName] = $basedNearBnode->uri;
				
				}
			} else {
					
					$basedNearBnode = new BlankNode($basedNearName);
			}
			
			/*add new ones*/
			if($basedNearContents && $basedNearContents->latitude != NULL && $basedNearContents->longitude != NULL){
				
				$newStatementLat = new Statement($basedNearBnode, new Resource('http://www.w3.org/2003/01/geo/wgs84_pos#lat'), new Literal($basedNearContents->latitude));
				$newStatementLong = new Statement($basedNearBnode, new Resource('http://www.w3.org/2003/01/geo/wgs84_pos#long'), new Literal($basedNearContents->longitude));
				$newStatementLatLong = new Statement($basedNearBnode, new Resource('http://www.w3.org/2003/01/geo/wgs84_pos#lat_long'), new Literal($basedNearContents->latitude.",".$basedNearContents->longitude));
				
				$foafData->getModel()->add($newStatementLat);
				$foafData->getModel()->add($newStatementLong);
				$foafData->getModel()->add($newStatementLatLong);
			} 
				
			//we don't want to remove this one
			$doNotCleanArray[$basedNearBnode->uri] = $basedNearBnode->uri;
			
		}

		/*clean out all based_nears that we haven't edited*/
		$allBasedNears = $foafData->getModel()->find(new Resource($foafData->getPrimaryTopic()), new Resource('http://xmlns.com/foaf/0.1/based_near'), NULL);
		foreach($allBasedNears->triples as $triple){
			if(!$doNotCleanArray[$triple->obj->uri]){
				$foafData->getModel()->remove($triple);
			}
		}
		
		/*so that we can keep track*/
		$foafData->setRandomStringToBnodeArray($randomStringToBnodeArray);
    }
    

    private function isLatLongValid($date) {
        //FIXME: something should go here to make sure the string makes sense.
        if ($date == null || $date == '') {
            return false;
        } else {
            return true;
        }
    }

    private function isCoordValid($date) {
    //FIXME: something should go here to make sure the string makes sense.
    if ($date == null || $date == '') {
            return false;
        } else {
            return true;
        }
    }
  
    private function objectToArray($value) {
        $ret = array();
        foreach($value as $key => $value) {
            $ret[$key] = $value;
        }
        return $ret;
    }
    
   	/*takes a row from a sparql resultset and puts any based_near information into data*/
    private function addBasedNearElements($row){
    	$newArray = array();
        
    	if (isset($row['?geoLatLong']) && $this->isLatLongValid($row['?geoLatLong'])) {
        	$latLongArray = split(",",$row['?geoLatLong']->label);
            $newArray['latitude']= $latLongArray[1];
            $newArray['longitude']= $latLongArray[0];    	
        }
        if (isset($row['?geoLat']) && $this->isCoordValid($row['?geoLat']) &&
        	isset($row['?geoLong']) && $this->isCoordValid($row['?geoLong'])) {
            
        	$newArray['latitude'] = $row['?geoLat']->label;
            $newArray['longitude'] = $row['?geoLong']->label;
        }
        if(isset($newArray['latitude']) && isset($newArray['longitude']) && isset($row['?location']) && $row['?location']->uri){
            $this->data['basedNearFields']['basedNear'][$row['?location']->uri] = $newArray;
        }
    }
    
    
    
    private function getQueryString($primaryTopic){
    	
    	//TODO: add vacationhome and other locations as appropriate as well as more based_near detail and contact_nearest_airport
    	$queryString = "PREFIX contact: <http://www.w3.org/2000/10/swap/pim/contact#>
               	PREFIX foaf: <http://xmlns.com/foaf/0.1/>
                PREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#>
                PREFIX bio: <http://purl.org/vocab/bio/0.1/>
                PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
                PREFIX wn: <http://xmlns.com/wordnet/1.6/>
                PREFIX air: <http://dig.csail.mit.edu/TAMI/2007/amord/air#>
             	PREFIX airalt: <http://www.megginson.com/exp/ns/airports#>
                SELECT 
                	?geoLat 
                	?geoLong 
                	?geoLatLong 
                	?location 
                	
                	?home
                	?homeGeoLat
                	?homeGeoLong 
                	?homeGeoLatLong 
                	?homeCity
                	?homeCountry
                	?homeStreet
                	?homeStreet2
                	?homeStreet3
                	?homePostalCode
                	?homeStateOrProvince
                	
                	?office
                	?officeGeoLat
                	?officeGeoLong 
                	?officeGeoLatLong 
                	?officeCity
                	?officeCountry
                	?officeStreet
                	?officeStreet2
                	?officeStreet3
                	?officePostalCode
                	?officeStateOrProvince
                	
                	?icaoCode
                	?iataCode
                	?icaoCodeAlt
                	?iataCodeAlt
                
                WHERE{
	                	?z foaf:primaryTopic <".$primaryTopic.">
	                	?z foaf:primaryTopic ?primaryTopic
	              
	                OPTIONAL{
	                	?primaryTopic foaf:based_near ?location .
	                	?location geo:lat_long ?geoLatLong .
	                } .
	                OPTIONAL{
	                	?primaryTopic foaf:based_near ?location .
	                	?location geo:lat ?geoLat .
	                	?location geo:long ?geoLong .     
	                }
        		
                }";
    	return $queryString;
    }

}

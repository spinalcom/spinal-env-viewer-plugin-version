/*
 * Copyright 2019 SpinalCom - www.spinalcom.com
 *
 *  This file is part of SpinalCore.
 *
 *  Please read all of the following terms and conditions
 *  of the Free Software license Agreement ("Agreement")
 *  carefully.
 *
 *  This Agreement is a legally binding contract between
 *  the Licensee (as defined below) and SpinalCom that
 *  sets forth the terms and conditions that govern your
 *  use of the Program. By installing and/or using the
 *  Program, you agree to abide by all the terms and
 *  conditions stated or referenced herein.
 *
 *  If you do not agree to abide by these terms and
 *  conditions, do not demonstrate your acceptance and do
 *  not install or use the Program.
 *  You should have received a copy of the license along
 *  with this file. If not, see
 *  <http://resources.spinalcom.com/licenses.pdf>.
 */

import { SpinalContextApp } from 'spinal-env-viewer-context-menu-service';
import { SpinalGraphService } from "spinal-env-viewer-graph-service";
import { loadModelPtr } from "./utils";

const { spinalPanelManagerService } = require( "spinal-env-viewer-panel-manager-service" );

export class OpenVersionButton extends SpinalContextApp {
  
  constructor() {
    super( 'Open Model Manager', 'Open Model Manager', {
      icon: 'sort',
      icon_type: 'in',
      backgroundColor: '#000000',
      fontColor: '#ffffff'
    } );
    
    this.action = this.openPanel.bind( this );
  }
  
  isShown( option ) {
    return Promise.resolve( true );
  }
  
 
  
  openPanel(  ) {
    const context = SpinalGraphService.getContext( 'BimFileContext' );
    const promises = [];
    
    SpinalGraphService.getChildrenInContext( context.info.id.get(), context.info.id.get() )
      .then( children => {
       
        spinalPanelManagerService.openPanel( "CompareVersion", {bimFiles: children} );
      
  
      } )
  }
}
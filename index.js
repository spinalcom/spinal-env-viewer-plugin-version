import { spinalContextMenuService } from "spinal-env-viewer-context-menu-service";
import { SpinalForgeExtention } from "spinal-env-viewer-panel-manager-service_spinalforgeextention";

import { OpenVersionButton } from "./src/OpenVersionButton";
import Vue from 'vue'
import Vuetify from 'vuetify'
import CompareVersion from "./src/vue/CompareVersion.vue";
export const TOP_BAR_HOOK_NAME = 'GraphManagerTopBar';

Vue.use(Vuetify);

spinalContextMenuService.registerApp( TOP_BAR_HOOK_NAME, new OpenVersionButton(), [7] );
const compareVersion =  SpinalForgeExtention.createExtention( {
  name: 'CompareVersion',
  vueMountComponent: Vue.extend( CompareVersion ),
  panel: {
    title: "Compare BIM Version",
    classname: "spinal-pannel",
    closeBehaviour: "hide"
  },
  style: {
    left: "805px",
    width: "430px",
    height: "80vh",
    display: "flex"
    
  }
} );


SpinalForgeExtention.registerExtention( "CompareVersion", compareVersion );
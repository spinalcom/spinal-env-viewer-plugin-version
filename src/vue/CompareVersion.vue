<template>
    <div class="compare-bim-panel">
        <v-container grid-list-md text-xs-center>

            <v-layout wrap align-center>
                <v-flex xs12 sm6 d-flex>

                    <v-select
                            :items="items"
                            :dark="true"
                            label="Model"
                            @input="onBIMFileSelected"
                            :attach="true"
                    ></v-select>

                </v-flex>


                <v-flex d-flex xs12 v-if="displayVersion">

                    <v-flex d-flex xs4>
                        <v-select
                                :items="versionNum"
                                :dark="true"
                                label="Nouvelle version"
                                @input="onPrimaryVersionSelected"
                                :attach="true"
                        ></v-select>
                    </v-flex>
                    <v-flex d-flex xs4>
                        <v-icon class="compare-icon" large>
                            compare_arrows
                        </v-icon>
                    </v-flex>
                    <v-flex d-flex xs4>
                        <v-select
                                :items="versionNum"
                                :dark="true"
                                label="Anciene version"
                                @input="onSecondaryVersionSelected"
                                :attach="true"
                        ></v-select>
                    </v-flex>

                </v-flex>

                <v-flex v-if="primaryVersion !== 0 && secondaryVersion !== 0
                  && !comparisonDone ">
                    <v-btn color="blue" @click="compareVersion"> Comparer
                    </v-btn>
                </v-flex>
                <v-flex d-flex xs12 v-if="comparisonDone">
                    <v-flex d-flex>
                        Nombre object de la premiere version :
                        {{primaryExternalIds.length}}
                    </v-flex>
                    <v-flex d-flex>
                        <div class="empty-space">
                            test version comment
                        </div>
                    </v-flex>
                    <v-flex d-flex>
                        Nombre object de la seconde version :
                        {{secondaryExternalIds.length}}
                    </v-flex>

                </v-flex>
                <v-flex xs12 class="comparison-summary" v-if="comparisonDone">
                    Resumé de comparaison
                    <div>

                        <db-ids-selector :ids="removedExternalId"
                                         title="Nombre object supprimé"
                                         :model="secondModel"
                                         typeIds="removed"
                                         @select="select"
                                         @isolate="isolate"
                        />
<!--
                        <db-ids-selector :ids="sameExternalIds"
                                         title="Nombre object conservé "
                                         :model="firstModel"
                                         typeIds="same"
                                         @select="select"
                                         @isolate="isolate"
                        />
-->
                        <db-ids-selector :ids="newExternalIds"
                                         title="Nombre de nouveaux object"
                                         :model="firstModel"
                                         typeIds="new"
                                         @select="select"
                                         @isolate="isolate"
                        />
                    </div>
                </v-flex>
            </v-layout>

        </v-container>
    </div>
</template>
<script>
  import { loadModelPtr } from "../utils";
  import DbIdsSelector from "./DbIdsSelector.vue";

  export default {
    name: "CompareVersion",
    components: { DbIdsSelector },
    data: function () {
      return {
        viewer: null,
        dialog: false,
        items: [],
        bimFiles: [],
        selectedModel: "",
        displayVersion: false,
        versionList: [],
        nbVersion: 0,
        versionNum: [],
        versionExcludeNum: [],
        primaryVersion: 0,
        secondaryVersion: 0,
        comparisonDone: false,
        primaryDbids: [],
        secondaryDbids: [],
        primaryExternalIds: [],
        secondaryExternalIds: [],
        firstModel: null,
        secondModel: null,
        removedExternalId: [],
        sameExternalIds: [],
        newExternalIds: [],
        removedId: [],
        sameId: [],
        newId: [],
        externalIdMapping: {}
      }
    },
    computed: {
      availableVersionNum: function () {
        this.versionNum.filter()
      }
    },
    methods: {

      init: function ( option ) {
        this.dialog = true;
        this.items = [];
        this.bimFiles = option.bimFiles;
        this.selectedModel = "";
        this.displayVersion = false;
        this.versionList = [];
        this.nbVersion = 0;
        this.versionNum = [];
        this.comparisonDone = false;
        this.primaryDbids = [];
        this.secondaryDbids = [];
        this.primaryExternalIds = [];
        this.secondaryExternalIds = [];
        this.firstModel = null;
        this.externalIdMapping = {}
      },
      opened: function ( option ) {
        this.init( option );

        for (let i = 0; i < this.bimFiles.length; i++) {
          this.items.push( { text: this.bimFiles[i].name.get(), value: i } );
        }

        this.viewer = window.spinal.ForgeViewer.viewer;
      },
      onBIMFileSelected: function ( e ) {
        this.selectedModel = e;
      },
      getVersionList: function ( bimFile ) {
        loadModelPtr( bimFile.element.ptr ).then( elt => {
          this.versionList = elt.versionLst;
          this.nbVersion = elt.versionLst.length;
          for (let i = 0; i < elt.versionLst.length; i++) {
            this.versionNum.push( i + 1 );
          }
        } )
      },
      onPrimaryVersionSelected: function ( e ) {
        this.primaryVersion = e;
      },
      onSecondaryVersionSelected: function ( e ) {
        this.secondaryVersion = e;
      },
      compareVersion: async function () {

        const primaryPath = this.getSVF(
          this.versionList[this.primaryVersion - 1],
          this.primaryVersion
        );

        const secondaryPath = this.getSVF(
          this.versionList[this.secondaryVersion - 1],
          this.secondaryVersion
        );

        this.firstModel = await this.loadModel( primaryPath );
        this.secondModel = await this.loadModel( secondaryPath );


        this.primaryDbids = await this.getDBIDs( this.firstModel );
        this.secondaryDbids = await this.getDBIDs( this.secondModel );

        let primaryProms = this.primaryDbids.map( dbId => {
          return this.getExternalId( dbId, this.firstModel );
        } );
        let secondaryProm = this.secondaryDbids.map( dbId => {
          return this.getExternalId( dbId, this.secondModel );
        } );


        this.primaryExternalIds = await this.promAll( primaryProms );
        this.secondaryExternalIds = await this.promAll( secondaryProm );

        this.removedExternalId = this.secondaryExternalIds
          .filter( id => this.primaryExternalIds.indexOf( id ) === -1 );
        this.sameExternalIds = this.primaryExternalIds.filter( id =>
          this.secondaryExternalIds.indexOf( id ) !== -1 );
        this.newExternalIds = this.primaryExternalIds.filter( id =>
          this.secondaryExternalIds.indexOf( id ) === -1 );


        this.mapExternalId()
          .then( () => {
            console.log( "mapping done" );
            this.viewer = window.spinal.ForgeViewer.viewer;
            console.log('mapping ici ', this);
              /*  this.viewer.hide( this.sameId, this.firstModel );
               this.viewer.hide( this.sameId, this.secondModel );
               */
            this.colorModel( this.newIds, this.firstModel, new THREE.Vector4(
              0, 255, 0, 0.7 ) );
            this.colorModel( this.removedId, this.secondModel, new
            THREE.Vector4( 255, 0, 0, 0.7 ) );
            window.newId = this.newIds;
            window.removedId = this.removedId;


            this.viewer.impl.invalidate();
            this.comparisonDone = true;
          } )

      },
      colorModel( ids, model, color ) {

        for (let i = 0; i < ids.length; i++) {
          const id = ids[i];

          if (id !== 1) {
            this.viewer.setThemingColor(
              id,
              color,
              model,
              false
            );
          }

        }
      },
      mapExternalId:  function () {
        return new Promise ( async (resolve, reject) => {
          try {
            this.removedId = await this.getAllDbIdFromExternalId( this.removedExternalId,
              this.secondModel );
            this.newIds = await this.getAllDbIdFromExternalId( this.newExternalIds,
              this.firstModel );
            resolve();
          } catch ( e ) {
            reject(e);
          }
        })


      },

      async promAll( proms ) {
        const res = [];
        for (let i = 0; i < proms.length; i++) {
          try {

            res.push( await proms[i] );
          } catch ( e ) {
            console.error( e );
          }
        }

        return res;
      },

      getExternalId: function ( dbId, model ) {
        return new Promise( ( resolve, reject ) => {
          model.getProperties( dbId, ( props ) => {
            resolve( props.externalId );
          }, reject )
        } )
      },

      getAllDbIdFromExternalId: function ( externalIds, model ) {
        const proms = [];
        for (let i = 0; i < externalIds.length; i++) {
          proms.push( this.getDbIdFromExternalId( externalIds[i], model ) )
        }

        return Promise.all( proms )
      },
      getDbIdFromExternalId: function ( externalId, model ) {
        return new Promise( ( resolve, reject ) => {
          if (typeof this.externalIdMapping[model.id] === "undefined") {
            model.getExternalIdMapping( (function external( res ) {
              this.externalIdMapping[model.id] = res;
              resolve( res[externalId] );
            }).bind( this ), reject );
          } else
            resolve( this.externalIdMapping[model.id][externalId] );
        } )
      },

      getAllDbIdsRec( model, callback ) {
        let cbCount = 0; // count pending callbacks
        const components = []; // store the results
        let tree; // the instance tree

        function getLeafComponentsRec( parent ) {
          cbCount++;
          if (tree.getChildCount( parent ) !== 0) {
            tree.enumNodeChildren( parent, function ( children ) {
              getLeafComponentsRec( children );
            }, false );
          } else
            components.push( parent );
          if (--cbCount === 0) callback( components );
        }

        model.getObjectTree( function ( objectTree ) {
          tree = objectTree;
          var allLeafComponents = getLeafComponentsRec( tree.getRootId() );
        } );
      },

      getDBIDs( model ) {
        return new Promise( resolve => {
          this.getAllDbIdsRec( model, resolve );
        } )
      },

      loadModel( path ) {
        return new Promise( ( resolve, reject ) => {
          const eventListener = ( e ) => {
            this.viewer.removeEventListener( eventListener );
            resolve( e.model )
          };

          this.viewer.addEventListener( Autodesk.Viewing.GEOMETRY_LOADED_EVENT,
            eventListener.bind( this ) );

          this.viewer.loadModel( path, {}, () => {}, ( e ) => {
            this.viewer.removeEventListener( eventListener );
            reject( e );

          } );
        } )
      },
      getSVF: function ( version ) {
        const items = version.items;

        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          if (item.path.get().indexOf( 'svf' ) !== -1) {
            //TODO change with env
            return "http://" + window.location.host + item.path.get()
          }
        }
      },

      isolate: function ( event ) {
        let ids;
        switch ( event.typeIds ) {
          case "new":
            ids= this.newIds;
            break;
          case "removed":
            ids = this.removedId;
            break;
          default:
            ids = this.sameExternalIds;
        }

        if (event.model.id === 2){
          this.hideModel(this.secondModel);
        }
        else {
          this.hideModel(this.firstModel)
        }

        console.log( "isolate", event, this.removedId, this.newIds );
        this.viewer.isolate( ids, event.model );

      },
      select: function ( event ) {
        let ids;
        switch ( event.typeIds ) {
          case "new":
            ids= this.newIds;
            break;
          case "removed":
            ids = this.removedId;
            break;
          default:
            ids = this.sameExternalIds;
        }
        if (event.model.id === 2){
          this.hideModel(this.secondModel);
        }
        else {
          this.hideModel(this.firstModel)
        }
        this.viewer.select( ids, event.model,
          Autodesk.Viewing.SelectionMode.MIXED);
      },
      hideModel(model){
        this.viewer.hideModel(model.id);
        if (model.id === 2)
          this.viewer.showModel(3);
        else
          this.viewer.showModel(2);
      }
    },
    watch: {
      selectedModel: {
        handler: function ( value ) {
          this.displayVersion = value !== "";
          if (value !== "") {
            const index = parseInt( value );
            if (!isNaN( index ))
              this.getVersionList( this.bimFiles[index] )
          }

        },
        immediate: true
      }
    }
  }
</script>
<style>
    .compare-bim-panel {
        height: calc(100% - 19px);
        margin: 10px;
    }

    .compare-bim-panel * {
        box-sizing: border-box;
    }

    .comparison-summary {
        border: 1px solid white;
        margin: 8px;
        padding: 8px;

    }

    .empty-space {
        visibility: hidden;
    }

    .compare-icon {
        display: inline-flex;
    }
</style>


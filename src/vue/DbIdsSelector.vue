<template>
    <div>
        {{title}} :
        {{ids.length}}
        <v-btn flat icon color="white" @click="select">
            <v-icon>select_all</v-icon>
        </v-btn>
        <v-btn flat icon color="white" @click="isolate">
            <v-icon>settings_overscan</v-icon>
        </v-btn>
    </div>
</template>

<script>
  export default {
    name: "DbIdsSelector",
    props: {
      title: {type: String, required: true},
      ids: {type: Array, required: true},
      model: {type: Object, required: true},
      typeIds : {type: String, required: true}
    },
    methods:{
      isolate: function () {
        this.$emit('isolate', {ids: this.ids, model: this.model, typeIds:
          this.typeIds})
      },
      select: function (){
        this.$emit('select', {ids: this.ids, model: this.model, typeIds: this.typeIds})
      }
    }
  }
</script>

<style scoped>

</style>
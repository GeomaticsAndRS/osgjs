( function () {
    'use strict';

    var osgShader = window.OSG.osgShader;
    var osg = window.OSG.osg;
    var shaderNode = osgShader.node;
    var factory = osgShader.nodeFactory;

    var TemporalAttribute = window.TemporalAttribute = function () {
        osg.StateAttribute.call( this );
        this._attributeEnable = false;
    };
    TemporalAttribute.prototype = osg.objectLibraryClass( osg.objectInherit( osg.StateAttribute.prototype, {
        attributeType: 'Temporal',

        cloneType: function () {
            return new TemporalAttribute();
        },

        // uniforms list are per ClassType
        getOrCreateUniforms: function () {
            var obj = TemporalAttribute;
            if ( obj.uniforms ) return obj.uniforms;

            obj.uniforms = new osg.Map( {
                'enable': osg.Uniform.createInt1( 0, 'temporalEnable' )
            } );

            return obj.uniforms;
        },

        setAttributeEnable: function ( state ) {
            this._attributeEnable = state;
            this.dirty();
        },

        getAttributeEnable: function () {
            return this._attributeEnable;
        },

        apply: function ( /*state*/) {
            var uniforms = this.getOrCreateUniforms();
            var value = this._attributeEnable ? 1 : 0;
            uniforms.enable.set( value );

            this.setDirty( false );
        }


    } ), 'osg', 'Temporal' );



} )();

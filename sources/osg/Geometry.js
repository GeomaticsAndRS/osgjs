define( [
    'osg/Utils',
    'osg/Vec3',
    'osg/Node',
    'osg/BoundingBox'
], function ( MACROUTILS, Vec3, Node, BoundingBox ) {

    'use strict';

    /**
     * Geometry manage array and primitives to draw a geometry.
     * @class Geometry
     */
    var Geometry = function () {
        Node.call( this );
        this.primitives = [];
        this.attributes = {};
        this._boundingBox = new BoundingBox();
        this._boundingBoxComputed = false;
        this.cacheAttributeList = {};
        this._shape = null;
    };

    /** @lends Geometry.prototype */
    Geometry.prototype = MACROUTILS.objectLibraryClass( MACROUTILS.objectInehrit( Node.prototype, {
        releaseGLObjects: function ( gl ) {
            if ( this.stateset !== undefined ) this.stateset.releaseGLObjects();
            var i;
            for ( i in this.attributes ) {
                this.attributes[ i ].releaseGLObjects( gl );
            }
            for ( var j = 0, l = this.primitives.length; j < l; j++ ) {
                var prim = this.primitives[ j ];
                if ( prim.getIndices !== undefined ) {
                    if ( prim.getIndices() !== undefined && prim.getIndices() !== null ) {
                        prim.indices.releaseGLObjects( gl );
                    }
                }
            }
        },
        dirtyBound: function () {
            if ( this._boundingBoxComputed === true ) {
                this._boundingBoxComputed = false;
            }
            Node.prototype.dirtyBound.call( this );
        },

        dirty: function () {
            this.cacheAttributeList = {};
        },
        getPrimitives: function () {
            return this.primitives;
        },
        getAttributes: function () {
            return this.attributes;
        },
        getShape: function () {
            return this._shape;
        },
        setShape: function ( shape ) {
            this._shape = shape;
        },
        getVertexAttributeList: function () {
            return this.attributes;
        },
        getPrimitiveSetList: function () {
            return this.primitives;
        },

        drawImplementation: function ( state ) {
            var program = state.getLastProgramApplied();
            var prgID = program.getInstanceID();
            if ( this.cacheAttributeList[ prgID ] === undefined ) {
                var attribute;

                var attributesCacheKeys = program._attributesCache.getKeys();
                var attributesCacheMap = program._attributesCache;
                var attributeList = [];

                var generated = '//generated by Geometry::implementation\n';
                generated += 'state.lazyDisablingOfVertexAttributes();\n';
                generated += 'var attr;\n';

                for ( var i = 0, l = attributesCacheKeys.length; i < l; i++ ) {
                    var key = attributesCacheKeys[ i ];
                    attribute = attributesCacheMap[ key ];
                    var attr = this.attributes[ key ];
                    if ( attr === undefined ) {
                        continue;
                    }
                    attributeList.push( attribute );
                    // dont display the geometry if missing data
                    generated += 'attr = this.attributes[\'' + key + '\'];\n';
                    generated += 'if (!attr.isValid()) { return; }\n';
                    generated += 'state.setVertexAttribArray(' + attribute + ', attr, false);\n';
                }
                generated += 'state.applyDisablingOfVertexAttributes();\n';
                var primitives = this.primitives;
                generated += 'var primitives = this.primitives;\n';
                for ( var j = 0, m = primitives.length; j < m; ++j ) {
                    generated += 'primitives[' + j + '].draw(state);\n';
                }

                /*jshint evil: true */
                this.cacheAttributeList[ prgID ] = new Function( 'state', generated );
                /*jshint evil: false */
            }
            this.cacheAttributeList[ prgID ].call( this, state );
        },

        // for testing disabling drawing
        drawImplementationDummy: function ( state ) {
            /*jshint unused: true */
            // for testing only that's why the code is not removed
            var program = state.getLastProgramApplied();
            var attribute;
            var attributeList = [];
            var attributesCache = program._attributesCache;


            var primitives = this.primitives;
            //state.disableVertexAttribsExcept(attributeList);

            for ( var j = 0, m = primitives.length; j < m; ++j ) {
                //primitives[j].draw(state);
            }
            /*jshint unused: false */
        },

        getBoundingBox: function () {
            if ( !this._boundingBoxComputed ) {
                this.computeBoundingBox( this._boundingBox );
                this._boundingBoxComputed = true;
            }
            return this._boundingBox;
        },

        setBound: function ( bb ) {
            this._boundingBox = bb;
            this._boundingBoxComputed = true;
        },

        computeBoundingBox: function ( boundingBox ) {

            var vertexArray = this.getAttributes().Vertex;
            var v = [ 0.0, 0.0, 0.0 ];
            if ( vertexArray !== undefined &&
                vertexArray.getElements() !== undefined &&
                vertexArray.getItemSize() > 2 ) {
                var vertexes = vertexArray.getElements();
                Vec3.init( v );
                for ( var idx = 0, l = vertexes.length; idx < l; idx += 3 ) {
                    v[ 0 ] = vertexes[ idx ];
                    v[ 1 ] = vertexes[ idx + 1 ];
                    v[ 2 ] = vertexes[ idx + 2 ];
                    boundingBox.expandByVec3( v );
                }
            }
            return boundingBox;
        },

        computeBound: function ( boundingSphere ) {
            boundingSphere.init();
            var bb = this.getBoundingBox();
            boundingSphere.expandByBoundingBox( bb );
            return boundingSphere;
        }
    } ), 'osg', 'Geometry' );

    MACROUTILS.setTypeID( Geometry );

    return Geometry;
} );

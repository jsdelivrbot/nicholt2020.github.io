/* */ 
"format cjs";
(function(global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core'), require('./compiler.umd'), require('@angular/core/testing')) : typeof define === 'function' && define.amd ? define(['exports', '@angular/core', '@angular/compiler', '@angular/core/testing'], factory) : (factory((global.ng = global.ng || {}, global.ng.compiler = global.ng.compiler || {}, global.ng.compiler.testing = global.ng.compiler.testing || {}), global.ng.core, global.ng.compiler, global.ng.core.testing));
}(this, function(exports, _angular_core, _angular_compiler, _angular_core_testing) {
  'use strict';
  var MockSchemaRegistry = (function() {
    function MockSchemaRegistry(existingProperties, attrPropMapping, existingElements, invalidProperties, invalidAttributes) {
      this.existingProperties = existingProperties;
      this.attrPropMapping = attrPropMapping;
      this.existingElements = existingElements;
      this.invalidProperties = invalidProperties;
      this.invalidAttributes = invalidAttributes;
    }
    MockSchemaRegistry.prototype.hasProperty = function(tagName, property, schemas) {
      var value = this.existingProperties[property];
      return value === void 0 ? true : value;
    };
    MockSchemaRegistry.prototype.hasElement = function(tagName, schemaMetas) {
      var value = this.existingElements[tagName.toLowerCase()];
      return value === void 0 ? true : value;
    };
    MockSchemaRegistry.prototype.allKnownElementNames = function() {
      return Object.keys(this.existingElements);
    };
    MockSchemaRegistry.prototype.securityContext = function(selector, property, isAttribute) {
      return _angular_core.SecurityContext.NONE;
    };
    MockSchemaRegistry.prototype.getMappedPropName = function(attrName) {
      return this.attrPropMapping[attrName] || attrName;
    };
    MockSchemaRegistry.prototype.getDefaultComponentElementName = function() {
      return 'ng-component';
    };
    MockSchemaRegistry.prototype.validateProperty = function(name) {
      if (this.invalidProperties.indexOf(name) > -1) {
        return {
          error: true,
          msg: "Binding to property '" + name + "' is disallowed for security reasons"
        };
      } else {
        return {error: false};
      }
    };
    MockSchemaRegistry.prototype.validateAttribute = function(name) {
      if (this.invalidAttributes.indexOf(name) > -1) {
        return {
          error: true,
          msg: "Binding to attribute '" + name + "' is disallowed for security reasons"
        };
      } else {
        return {error: false};
      }
    };
    MockSchemaRegistry.prototype.normalizeAnimationStyleProperty = function(propName) {
      return propName;
    };
    MockSchemaRegistry.prototype.normalizeAnimationStyleValue = function(camelCaseProp, userProvidedProp, val) {
      return {
        error: null,
        value: val.toString()
      };
    };
    return MockSchemaRegistry;
  }());
  function isPresent(obj) {
    return obj != null;
  }
  function stringify(token) {
    if (typeof token === 'string') {
      return token;
    }
    if (token == null) {
      return '' + token;
    }
    if (token.overriddenName) {
      return token.overriddenName;
    }
    if (token.name) {
      return token.name;
    }
    var res = token.toString();
    var newLineIndex = res.indexOf('\n');
    return newLineIndex === -1 ? res : res.substring(0, newLineIndex);
  }
  var __extends = (this && this.__extends) || function(d, b) {
    for (var p in b)
      if (b.hasOwnProperty(p))
        d[p] = b[p];
    function __() {
      this.constructor = d;
    }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
  var MockDirectiveResolver = (function(_super) {
    __extends(MockDirectiveResolver, _super);
    function MockDirectiveResolver(_injector) {
      _super.call(this);
      this._injector = _injector;
      this._directives = new Map();
      this._providerOverrides = new Map();
      this._viewProviderOverrides = new Map();
      this._views = new Map();
      this._inlineTemplates = new Map();
      this._animations = new Map();
    }
    Object.defineProperty(MockDirectiveResolver.prototype, "_compiler", {
      get: function() {
        return this._injector.get(_angular_core.Compiler);
      },
      enumerable: true,
      configurable: true
    });
    MockDirectiveResolver.prototype._clearCacheFor = function(component) {
      this._compiler.clearCacheFor(component);
    };
    MockDirectiveResolver.prototype.resolve = function(type, throwIfNotFound) {
      if (throwIfNotFound === void 0) {
        throwIfNotFound = true;
      }
      var metadata = this._directives.get(type);
      if (!metadata) {
        metadata = _super.prototype.resolve.call(this, type, throwIfNotFound);
      }
      if (!metadata) {
        return null;
      }
      var providerOverrides = this._providerOverrides.get(type);
      var viewProviderOverrides = this._viewProviderOverrides.get(type);
      var providers = metadata.providers;
      if (isPresent(providerOverrides)) {
        var originalViewProviders = metadata.providers || [];
        providers = originalViewProviders.concat(providerOverrides);
      }
      if (metadata instanceof _angular_core.Component) {
        var viewProviders = metadata.viewProviders;
        if (isPresent(viewProviderOverrides)) {
          var originalViewProviders = metadata.viewProviders || [];
          viewProviders = originalViewProviders.concat(viewProviderOverrides);
        }
        var view = this._views.get(type);
        if (!view) {
          view = metadata;
        }
        var animations = view.animations;
        var templateUrl = view.templateUrl;
        var inlineAnimations = this._animations.get(type);
        if (isPresent(inlineAnimations)) {
          animations = inlineAnimations;
        }
        var inlineTemplate = this._inlineTemplates.get(type);
        if (isPresent(inlineTemplate)) {
          templateUrl = null;
        } else {
          inlineTemplate = view.template;
        }
        return new _angular_core.Component({
          selector: metadata.selector,
          inputs: metadata.inputs,
          outputs: metadata.outputs,
          host: metadata.host,
          exportAs: metadata.exportAs,
          moduleId: metadata.moduleId,
          queries: metadata.queries,
          changeDetection: metadata.changeDetection,
          providers: providers,
          viewProviders: viewProviders,
          entryComponents: metadata.entryComponents,
          template: inlineTemplate,
          templateUrl: templateUrl,
          animations: animations,
          styles: view.styles,
          styleUrls: view.styleUrls,
          encapsulation: view.encapsulation,
          interpolation: view.interpolation
        });
      }
      return new _angular_core.Directive({
        selector: metadata.selector,
        inputs: metadata.inputs,
        outputs: metadata.outputs,
        host: metadata.host,
        providers: providers,
        exportAs: metadata.exportAs,
        queries: metadata.queries
      });
    };
    MockDirectiveResolver.prototype.setDirective = function(type, metadata) {
      this._directives.set(type, metadata);
      this._clearCacheFor(type);
    };
    MockDirectiveResolver.prototype.setProvidersOverride = function(type, providers) {
      this._providerOverrides.set(type, providers);
      this._clearCacheFor(type);
    };
    MockDirectiveResolver.prototype.setViewProvidersOverride = function(type, viewProviders) {
      this._viewProviderOverrides.set(type, viewProviders);
      this._clearCacheFor(type);
    };
    MockDirectiveResolver.prototype.setView = function(component, view) {
      this._views.set(component, view);
      this._clearCacheFor(component);
    };
    MockDirectiveResolver.prototype.setInlineTemplate = function(component, template) {
      this._inlineTemplates.set(component, template);
      this._clearCacheFor(component);
    };
    MockDirectiveResolver.prototype.setAnimations = function(component, animations) {
      this._animations.set(component, animations);
      this._clearCacheFor(component);
    };
    MockDirectiveResolver.decorators = [{type: _angular_core.Injectable}];
    MockDirectiveResolver.ctorParameters = [{type: _angular_core.Injector}];
    return MockDirectiveResolver;
  }(_angular_compiler.DirectiveResolver));
  var __extends$1 = (this && this.__extends) || function(d, b) {
    for (var p in b)
      if (b.hasOwnProperty(p))
        d[p] = b[p];
    function __() {
      this.constructor = d;
    }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
  var MockNgModuleResolver = (function(_super) {
    __extends$1(MockNgModuleResolver, _super);
    function MockNgModuleResolver(_injector) {
      _super.call(this);
      this._injector = _injector;
      this._ngModules = new Map();
    }
    MockNgModuleResolver.prototype.setNgModule = function(type, metadata) {
      this._ngModules.set(type, metadata);
      this._clearCacheFor(type);
    };
    MockNgModuleResolver.prototype.resolve = function(type, throwIfNotFound) {
      if (throwIfNotFound === void 0) {
        throwIfNotFound = true;
      }
      return this._ngModules.get(type) || _super.prototype.resolve.call(this, type, throwIfNotFound);
    };
    Object.defineProperty(MockNgModuleResolver.prototype, "_compiler", {
      get: function() {
        return this._injector.get(_angular_core.Compiler);
      },
      enumerable: true,
      configurable: true
    });
    MockNgModuleResolver.prototype._clearCacheFor = function(component) {
      this._compiler.clearCacheFor(component);
    };
    MockNgModuleResolver.decorators = [{type: _angular_core.Injectable}];
    MockNgModuleResolver.ctorParameters = [{type: _angular_core.Injector}];
    return MockNgModuleResolver;
  }(_angular_compiler.NgModuleResolver));
  var __extends$2 = (this && this.__extends) || function(d, b) {
    for (var p in b)
      if (b.hasOwnProperty(p))
        d[p] = b[p];
    function __() {
      this.constructor = d;
    }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
  var MockPipeResolver = (function(_super) {
    __extends$2(MockPipeResolver, _super);
    function MockPipeResolver(_injector) {
      _super.call(this);
      this._injector = _injector;
      this._pipes = new Map();
    }
    Object.defineProperty(MockPipeResolver.prototype, "_compiler", {
      get: function() {
        return this._injector.get(_angular_core.Compiler);
      },
      enumerable: true,
      configurable: true
    });
    MockPipeResolver.prototype._clearCacheFor = function(pipe) {
      this._compiler.clearCacheFor(pipe);
    };
    MockPipeResolver.prototype.setPipe = function(type, metadata) {
      this._pipes.set(type, metadata);
      this._clearCacheFor(type);
    };
    MockPipeResolver.prototype.resolve = function(type, throwIfNotFound) {
      if (throwIfNotFound === void 0) {
        throwIfNotFound = true;
      }
      var metadata = this._pipes.get(type);
      if (!metadata) {
        metadata = _super.prototype.resolve.call(this, type, throwIfNotFound);
      }
      return metadata;
    };
    MockPipeResolver.decorators = [{type: _angular_core.Injectable}];
    MockPipeResolver.ctorParameters = [{type: _angular_core.Injector}];
    return MockPipeResolver;
  }(_angular_compiler.PipeResolver));
  var TestingCompilerFactory = _angular_core_testing.__core_private_testing__.TestingCompilerFactory;
  var _nextReferenceId = 0;
  var MetadataOverrider = (function() {
    function MetadataOverrider() {
      this._references = new Map();
    }
    MetadataOverrider.prototype.overrideMetadata = function(metadataClass, oldMetadata, override) {
      var props = {};
      if (oldMetadata) {
        _valueProps(oldMetadata).forEach(function(prop) {
          return props[prop] = oldMetadata[prop];
        });
      }
      if (override.set) {
        if (override.remove || override.add) {
          throw new Error("Cannot set and add/remove " + stringify(metadataClass) + " at the same time!");
        }
        setMetadata(props, override.set);
      }
      if (override.remove) {
        removeMetadata(props, override.remove, this._references);
      }
      if (override.add) {
        addMetadata(props, override.add);
      }
      return new metadataClass(props);
    };
    return MetadataOverrider;
  }());
  function removeMetadata(metadata, remove, references) {
    var removeObjects = new Set();
    var _loop_1 = function(prop) {
      var removeValue = remove[prop];
      if (removeValue instanceof Array) {
        removeValue.forEach(function(value) {
          removeObjects.add(_propHashKey(prop, value, references));
        });
      } else {
        removeObjects.add(_propHashKey(prop, removeValue, references));
      }
    };
    for (var prop in remove) {
      _loop_1(prop);
    }
    var _loop_2 = function(prop) {
      var propValue = metadata[prop];
      if (propValue instanceof Array) {
        metadata[prop] = propValue.filter(function(value) {
          return !removeObjects.has(_propHashKey(prop, value, references));
        });
      } else {
        if (removeObjects.has(_propHashKey(prop, propValue, references))) {
          metadata[prop] = undefined;
        }
      }
    };
    for (var prop in metadata) {
      _loop_2(prop);
    }
  }
  function addMetadata(metadata, add) {
    for (var prop in add) {
      var addValue = add[prop];
      var propValue = metadata[prop];
      if (propValue != null && propValue instanceof Array) {
        metadata[prop] = propValue.concat(addValue);
      } else {
        metadata[prop] = addValue;
      }
    }
  }
  function setMetadata(metadata, set) {
    for (var prop in set) {
      metadata[prop] = set[prop];
    }
  }
  function _propHashKey(propName, propValue, references) {
    var replacer = function(key, value) {
      if (typeof value === 'function') {
        value = _serializeReference(value, references);
      }
      return value;
    };
    return propName + ":" + JSON.stringify(propValue, replacer);
  }
  function _serializeReference(ref, references) {
    var id = references.get(ref);
    if (!id) {
      id = "" + stringify(ref) + _nextReferenceId++;
      references.set(ref, id);
    }
    return id;
  }
  function _valueProps(obj) {
    var props = [];
    Object.keys(obj).forEach(function(prop) {
      if (!prop.startsWith('_')) {
        props.push(prop);
      }
    });
    var proto = obj;
    while (proto = Object.getPrototypeOf(proto)) {
      Object.keys(proto).forEach(function(protoProp) {
        var desc = Object.getOwnPropertyDescriptor(proto, protoProp);
        if (!protoProp.startsWith('_') && desc && 'get' in desc) {
          props.push(protoProp);
        }
      });
    }
    return props;
  }
  var TestingCompilerFactoryImpl = (function() {
    function TestingCompilerFactoryImpl(_compilerFactory) {
      this._compilerFactory = _compilerFactory;
    }
    TestingCompilerFactoryImpl.prototype.createTestingCompiler = function(options) {
      var compiler = this._compilerFactory.createCompiler(options);
      return new TestingCompilerImpl(compiler, compiler.injector.get(MockDirectiveResolver), compiler.injector.get(MockPipeResolver), compiler.injector.get(MockNgModuleResolver));
    };
    TestingCompilerFactoryImpl.decorators = [{type: _angular_core.Injectable}];
    TestingCompilerFactoryImpl.ctorParameters = [{type: _angular_core.CompilerFactory}];
    return TestingCompilerFactoryImpl;
  }());
  var TestingCompilerImpl = (function() {
    function TestingCompilerImpl(_compiler, _directiveResolver, _pipeResolver, _moduleResolver) {
      this._compiler = _compiler;
      this._directiveResolver = _directiveResolver;
      this._pipeResolver = _pipeResolver;
      this._moduleResolver = _moduleResolver;
      this._overrider = new MetadataOverrider();
    }
    Object.defineProperty(TestingCompilerImpl.prototype, "injector", {
      get: function() {
        return this._compiler.injector;
      },
      enumerable: true,
      configurable: true
    });
    TestingCompilerImpl.prototype.compileModuleSync = function(moduleType) {
      return this._compiler.compileModuleSync(moduleType);
    };
    TestingCompilerImpl.prototype.compileModuleAsync = function(moduleType) {
      return this._compiler.compileModuleAsync(moduleType);
    };
    TestingCompilerImpl.prototype.compileModuleAndAllComponentsSync = function(moduleType) {
      return this._compiler.compileModuleAndAllComponentsSync(moduleType);
    };
    TestingCompilerImpl.prototype.compileModuleAndAllComponentsAsync = function(moduleType) {
      return this._compiler.compileModuleAndAllComponentsAsync(moduleType);
    };
    TestingCompilerImpl.prototype.overrideModule = function(ngModule, override) {
      var oldMetadata = this._moduleResolver.resolve(ngModule, false);
      this._moduleResolver.setNgModule(ngModule, this._overrider.overrideMetadata(_angular_core.NgModule, oldMetadata, override));
    };
    TestingCompilerImpl.prototype.overrideDirective = function(directive, override) {
      var oldMetadata = this._directiveResolver.resolve(directive, false);
      this._directiveResolver.setDirective(directive, this._overrider.overrideMetadata(_angular_core.Directive, oldMetadata, override));
    };
    TestingCompilerImpl.prototype.overrideComponent = function(component, override) {
      var oldMetadata = this._directiveResolver.resolve(component, false);
      this._directiveResolver.setDirective(component, this._overrider.overrideMetadata(_angular_core.Component, oldMetadata, override));
    };
    TestingCompilerImpl.prototype.overridePipe = function(pipe, override) {
      var oldMetadata = this._pipeResolver.resolve(pipe, false);
      this._pipeResolver.setPipe(pipe, this._overrider.overrideMetadata(_angular_core.Pipe, oldMetadata, override));
    };
    TestingCompilerImpl.prototype.clearCache = function() {
      this._compiler.clearCache();
    };
    TestingCompilerImpl.prototype.clearCacheFor = function(type) {
      this._compiler.clearCacheFor(type);
    };
    return TestingCompilerImpl;
  }());
  var platformCoreDynamicTesting = _angular_core.createPlatformFactory(_angular_compiler.platformCoreDynamic, 'coreDynamicTesting', [{
    provide: _angular_core.COMPILER_OPTIONS,
    useValue: {providers: [MockPipeResolver, {
        provide: _angular_compiler.PipeResolver,
        useExisting: MockPipeResolver
      }, MockDirectiveResolver, {
        provide: _angular_compiler.DirectiveResolver,
        useExisting: MockDirectiveResolver
      }, MockNgModuleResolver, {
        provide: _angular_compiler.NgModuleResolver,
        useExisting: MockNgModuleResolver
      }]},
    multi: true
  }, {
    provide: TestingCompilerFactory,
    useClass: TestingCompilerFactoryImpl
  }]);
  exports.TestingCompilerFactoryImpl = TestingCompilerFactoryImpl;
  exports.TestingCompilerImpl = TestingCompilerImpl;
  exports.platformCoreDynamicTesting = platformCoreDynamicTesting;
  exports.MockSchemaRegistry = MockSchemaRegistry;
  exports.MockDirectiveResolver = MockDirectiveResolver;
  exports.MockNgModuleResolver = MockNgModuleResolver;
  exports.MockPipeResolver = MockPipeResolver;
}));

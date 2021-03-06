'use strict';

const Npc = require('./Npc');
const BehaviorManager = require('./BehaviorManager');

/**
 * Stores definitions of entities to allow for easy creation/cloning
 */
class EntityFactory {
  constructor() {
    this.entities = new Map();
    this.scripts = new BehaviorManager();
  }

  /**
   * Create the key used by the entities and scripts maps
   * @param {string} areaName
   * @param {number} id
   * @return {string}
   */
  createEntityRef(area, id) {
    return area + ':' + id;
  }

  /**
   * @param {string} entityRef
   * @return {Object}
   */
  getDefinition(entityRef) {
    const def = this.entities.get(entityRef);
    if (def && def.base) {
      const bases = Array.isArray(def.base) ? def.base : [def.base];
      let finalBase = {};
      bases.forEach(base => {
        const baseDef = this.getDefinition(base);
        if (!baseDef) {
          throw new Error(`Base Entity "${base}" not found for ${entityRef}`);
        }
        finalBase = this.mergeDefinitions(finalBase, baseDef);
      });
      return this.mergeDefinitions(def, finalBase);
    }
    return def;
  }

  /**
   * Handle the merge of a base definition with a target 
   * definition.
   * 
   * @param {Object} def 
   * @param {Object} baseDef 
   */
  mergeDefinitions(def, baseDef) {
    return {...baseDef, ...def };
  }
  
  /**
   * @param {string} entityRef
   * @param {Object} def
   */
  setDefinition(entityRef, def) {
    def.entityReference = entityRef;
    this.entities.set(entityRef, def);
  }

  /**
   * Add an event listener from a script to a specific item
   * @see BehaviorManager::addListener
   * @param {string}   entityRef
   * @param {string}   event
   * @param {Function} listener
   */
  addScriptListener(entityRef, event, listener) {
    this.scripts.addListener(entityRef, event, listener);
  }

  /**
   * Create a new instance of a given npc definition. Resulting npc will not be held or equipped
   * and will _not_ have its default contents. If you want it to also populate its default contents
   * you must manually call `npc.hydrate(state)`
   *
   * @param {Area}   area
   * @param {string} entityRef
   * @param {Class}  Type      Type of entity to instantiate
   * @return {type}
   */
  createByType(area, entityRef, Type) {
    const definition = this.getDefinition(entityRef);
    if (!definition) {
      throw new Error('No Entity definition found for ' + entityRef)
    }
    const entity = new Type(area, definition);

    if (this.scripts.has(entityRef)) {
      this.scripts.get(entityRef).attach(entity);
    }

    return entity;
  }

  create() {
    throw new Error("No type specified for Entity.create");
  }

  /**
   * Clone an existing entity.
   * @param {Item|Npc|Room|Area} entity
   * @return {Item|Npc|Room|Area}
   */
  clone(entity) {
    return this.create(entity.area, entity.entityReference);
  }
}

module.exports = EntityFactory;

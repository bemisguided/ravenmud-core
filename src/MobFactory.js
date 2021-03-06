'use strict';

const Npc = require('./Npc');
const EntityFactory = require('./EntityFactory');

/**
 * Stores definitions of npcs to allow for easy creation/cloning
 * @extends EntityFactory
 */
class MobFactory extends EntityFactory {
  /**
   * Create a new instance of a given npc definition. Resulting npc will not
   * have its default inventory.  If you want to also populate its default
   * contents you must manually call `npc.hydrate(state)`
   *
   * @param {Area}   area
   * @param {string} entityRef
   * @return {Npc}
   */
  create(area, entityRef) {
    const npc = this.createByType(area, entityRef, Npc);
    npc.area = area;
    return npc;
  }  

  /**
   * Handle the merge of a base definition with a target 
   * definition.
   * 
   * @param {Object} def 
   * @param {Object} baseDef 
   */
  mergeDefinitions(def, baseDef) {
    const { 
      keywords: baseKeywords,
      attributes: baseAttributes, 
      metadata: baseMetadata, 
      behaviors: baseBehaviors,
    } = baseDef;
    const defKeywords = def.keywords || [];
    const attributes = { ...baseAttributes, ...def.attributes };
    const metadata = { ...baseMetadata, ...def.metadata };
    const behaviors = { ...baseBehaviors, ...def.behaviors };
    const keywords = baseKeywords.concat(defKeywords.filter((k) => baseKeywords.indexOf(k) < 0))
    return {...baseDef, ...def, attributes, metadata, behaviors, keywords };
  }

}

module.exports = MobFactory;

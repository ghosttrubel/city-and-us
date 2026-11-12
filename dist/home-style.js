// Small, save-safe finish collection for the first apartment review.
export const HOME_STYLES={
 warm:{name:'Soft linen',wall:'#d4dfe4',wood:'#93a5b0',fabric:'#779ba5',rug:'#cad5dc'},
 dusk:{name:'Lagoon dusk',wall:'#cddce4',wood:'#849aa7',fabric:'#527b8a',rug:'#c4d1dc'},
 clay:{name:'Quiet stone',wall:'#d6dce2',wood:'#93a0ad',fabric:'#788b9e',rug:'#c7cbd4'}
};
export function validHomeStyle(value){return value===undefined||typeof value==='string'&&Object.hasOwn(HOME_STYLES,value)}

export const sanitizeAreaName = (name) => name
  // remove synonym e.g. Area TE 1.1 (HESCHL) => Area TE 1.1
  .replace(/\s\(.*?\)$/,'')
  // replace whitespaces with dashes e.g. Area TE 1.1 => Area-TE-1.1
  .replace(/\s/g, '-')
  // remove all dots e.g. Area-TE-1.1 => Area-TE-11
  .replace(/\./, '')
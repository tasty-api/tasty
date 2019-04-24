module.exports = {
  evalTpl,
};

function evalTpl(tpl, context = {}) {
  const func = new Function(`with(this) { return ${'`' + tpl + '`'}; }`);

  return func.call(context);
}

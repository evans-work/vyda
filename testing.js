const names = {}
names['1'] = 'evans'
console.log('with',names)
delete names['1']
console.log('after',names)
console.log('count',Object.keys(names).length)



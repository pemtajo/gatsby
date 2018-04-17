const contentful = require(`contentful`)
const _ = require(`lodash`)
var Remark = require(`remark`)
const select = require(`unist-util-select`)
const normalize = require(`./normalize`)
const chalk = require('chalk')
module.exports = async ({ spaceId, accessToken, host, syncToken }) => {
  // Fetch articles.
  console.time(`Fetch Contentful data`)
  console.log(`Starting to fetch data from Contentful`)

  const client = contentful.createClient({
    space: spaceId,
    accessToken,
    host: host || `cdn.contentful.com`,
  })

  // The sync API puts the locale in all fields in this format { fieldName:
  // {'locale': value} } so we need to get the space and its default local.
  //
  // We'll extend this soon to support multiple locales.
  let space
  let defaultLocale = `en-US`
  try {
    console.log(`Fetching default locale`)
    space = await client.getSpace()
    defaultLocale = _.find(space.locales, { default: true }).code
    console.log(`default local is : ${defaultLocale}`)
  } catch (e) {
    console.log(
      `Accessing your Contentful space failed. Perhaps you're offline or the spaceId/accessToken is incorrect.`
    )
    // TODO perhaps continue if there's cached data? That would let
    // someone develop a contentful site even if not connected to the internet.
    // For prod builds though always fail if we can't get the latest data.
    process.exit(1)
  }

  let currentSyncData
  try {
    // let query = syncToken ? { nextSyncToken: syncToken } : { initial: true }
    let query = { initial: true }
    currentSyncData = await client.sync(query)
  } catch (e) {
    console.log(`error fetching contentful data`, e)
    process.exit(1)
  }






  async function linkAssetsAndPosts() {
    const assetMapFromPosts = {} //?

    let currentSyncData
    try {
      let query = { initial: true, content_type: `post`, resolveLinks: true }
      currentSyncData = await client.sync(query)

      //currentSyncData.entries // ?
      const allPostsBody = currentSyncData.entries.map(data => {
        return {
          id: data.sys.id,
          body: data.fields.body,
        }
      })

      const t = await [`en`, `pt-BR`].forEach(lang => {
        // const md = allPostsBody[0].body[lang];

        if(typeof allPostsBody === 'undefined') return;

        allPostsBody.map(({ id, body }) => {
          const md = body[lang]

          let remark = new Remark().data(`settings`, {
            commonmark: true,
            footnotes: true,
            pedantic: true,
          })

          const ast = remark.parse(md)
          const imagesFromAST = select(ast, `image`)

          if (!_.isEmpty(imagesFromAST)) {
            if(typeof assetMapFromPosts[id] === 'undefined'){
              assetMapFromPosts[id] = {imagesAST: {}};
            }
            assetMapFromPosts[id] = {
              imagesAST: {
                [lang]: imagesFromAST,
              },
            }
          }
        })
      })
    } catch (e) {
      console.error(`[CATCH]`, e)
      process.exit(1)
    }
    return assetMapFromPosts
  }

  const assetsMapFromPosts = await linkAssetsAndPosts()








  // We need to fetch content types with the non-sync API as the sync API
  // doesn't support this.
  let contentTypes
  try {
    contentTypes = await pagedGet(client, `getContentTypes`)
  } catch (e) {
    console.log(`error fetching content types`, e)
  }
  console.log(`contentTypes fetched`, contentTypes.items.length)

  let contentTypeItems = contentTypes.items

  // Fix IDs on entries and assets, created/updated and deleted.
  contentTypeItems = contentTypeItems.map(c => normalize.fixIds(c))
  contentTypeItems[1].fields.push({ id: 'assetImage',
                name: 'assetImage',
                type: 'Link',
                localized: true,
                required: false,
                disabled: false,
                omitted: false,
                linkType: 'Asset',
                items: { type: 'Link', validations: [], linkType: 'Asset' } } )


  currentSyncData.entries = currentSyncData.entries.map(e => {
    if (e) {

      if(assetsMapFromPosts[e.sys.id]){
        // console.log(e.fields)
        //console.log(assetsMapFromPosts[e.sys.id].imagesAST)
      //  e.fields.imagesAST = assetsMapFromPosts[e.sys.id].imagesAST;

      //  console.log(]);

      let imagesFromEntry = [];
      assetsMapFromPosts[e.sys.id].imagesAST['pt-BR'].forEach(a =>{
          imagesFromEntry.push(_.find(currentSyncData.assets, asset => {
            return asset.fields.file['pt-BR'].url === a.url
          }));
      })
      console.log("()()()()())()()()()()()")
      console.log("()()()()())()()()()()()")
      console.log("()()()()())()()()()()()")
      console.log(chalk.red`${JSON.stringify(imagesFromEntry, null, 3)}`);
      console.log("()()()()())()()()()()()")
      console.log("()()()()())()()()()()()")
      console.log("()()()()())()()()()()()")
      console.log("()()()()())()()()()()()")

      const arrayToObject = (array) =>
      array.reduce((obj, item) => {
        obj[item.id] = item
        return obj
      }, {})

     const imagesObject = imagesFromEntry.map(c => normalize.fixIds(c));


     console.log(imagesFromEntry)
     console.log(imagesFromEntry)
     console.log(imagesFromEntry)
     console.log(imagesFromEntry)
     console.log(imagesFromEntry)
     console.log(imagesFromEntry)
     console.log(imagesFromEntry)
     console.log(imagesFromEntry)



     console.log(imagesObject)
     console.log(imagesObject)
     console.log(imagesObject)
     console.log(imagesObject)
     console.log(imagesObject)
     console.log(imagesObject)
     console.log(imagesObject)
     console.log(imagesObject)
      console.log('LUTANDO COM O INIMIGO')
      console.log(imagesFromEntry.map(c => normalize.fixIds(c)));
      // e.fields.LOL = imagesFromEntry


       e.fields.assetImage = { 'pt-BR': [...imagesObject]}
      }

      return normalize.fixIds(e)
    }
    return null
  })
  currentSyncData.assets = currentSyncData.assets.map(a => {

    // console.log(`[ASSET]:`, JSON.stringify(a));

    if (a) {
      return normalize.fixIds(a)
    }
    return null
  })
  currentSyncData.deletedEntries = currentSyncData.deletedEntries.map(e => {
    if (e) {
      return normalize.fixIds(e)
    }
    return null
  })
  currentSyncData.deletedAssets = currentSyncData.deletedAssets.map(a => {
    if (a) {
      return normalize.fixIds(a)
    }
    return null
  })

  return {
    currentSyncData,
    contentTypeItems,
    defaultLocale,
    locales: space.locales,
  }
}

/**
 * Gets all the existing entities based on pagination parameters.
 * The first call will have no aggregated response. Subsequent calls will
 * concatenate the new responses to the original one.
 */
function pagedGet(
  client,
  method,
  query = {},
  skip = 0,
  pageLimit = 1000,
  aggregatedResponse = null
) {
  return client[method]({
    ...query,
    skip: skip,
    limit: pageLimit,
    order: `sys.createdAt`,
  }).then(response => {
    if (!aggregatedResponse) {
      aggregatedResponse = response
    } else {
      aggregatedResponse.items = aggregatedResponse.items.concat(response.items)
    }
    if (skip + pageLimit <= response.total) {
      return pagedGet(client, method, skip + pageLimit, aggregatedResponse)
    }
    return aggregatedResponse
  })
}

// const contentful = require(`contentful`)
// var Remark = require(`remark`)
// const select = require(`unist-util-select`)
// const _ = require(`lodash`)
// const client = contentful.createClient({
//   space: `gszgyk802h81`,
//   accessToken: `f309e18346edb36fa35dd3a58af44f67cb3612e7b949ec2bd283fee5519b4d08`,
//   host: `cdn.contentful.com`,
// })

// async function linkAssetsAndPosts() {
//   const assetMapFromPosts = {} //?

//   let currentSyncData
//   try {
//     let query = { initial: true, content_type: `post`, resolveLinks: true }
//     currentSyncData = await client.sync(query)

//     //currentSyncData.entries // ?
//     const allPostsBody = currentSyncData.entries.map(data => {
//       return {
//         id: data.sys.id,
//         body: data.fields.body,
//       }
//     })

//     const t = await [`en`, `pt-BR`].forEach(lang => {
//       // const md = allPostsBody[0].body[lang];

//       allPostsBody.map(({ id, body }) => {
//         const md = body[lang]

//         let remark = new Remark().data(`settings`, {
//           commonmark: true,
//           footnotes: true,
//           pedantic: true,
//         })

//         const ast = remark.parse(md)
//         const imagesFromAST = select(ast, `image`)

//         if (!_.isEmpty(imagesFromAST)) {
//           assetMapFromPosts[id] = { imagesAST: imagesFromAST }
//         }
//       })
//     })
//   } catch (e) {
//     console.error(`[CATCH]`, e)
//     process.exit(1)
//   }
//   return assetMapFromPosts
// }

// linkAssetsAndPosts().then(assets => {
//   assets //?
// })

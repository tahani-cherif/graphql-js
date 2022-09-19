const express =require("express")
const { graphqlHTTP } = require('express-graphql');
const graphql = require('graphql')
const { GraphQLSchema, GraphQLObjectType, GraphQLString } = graphql
const app=express()
const authors = [
	{ id: 1, name: 'J. K. Rowling' },
	{ id: 2, name: 'J. R. R. Tolkien' },
	{ id: 3, name: 'Brent Weeks' }
]

const books = [
	{ id: 1, name: 'Harry Potter and the Chamber of Secrets', authorId: 1 },
	{ id: 2, name: 'Harry Potter and the Prisoner of Azkaban', authorId: 1 },
	{ id: 3, name: 'Harry Potter and the Goblet of Fire', authorId: 1 },
	{ id: 4, name: 'The Fellowship of the Ring', authorId: 2 },
	{ id: 5, name: 'The Two Towers', authorId: 2 },
	{ id: 6, name: 'The Return of the King', authorId: 2 },
	{ id: 7, name: 'The Way of Shadows', authorId: 3 },
	{ id: 8, name: 'Beyond the Shadows', authorId: 3 }
]

const Book=new GraphQLObjectType({ //objet de type book
  name :"book",
  fields : ()=>({
    id:{type:graphql.GraphQLNonNull(graphql.GraphQLInt)},
    name:{type:graphql.GraphQLNonNull(graphql.GraphQLString)},
    authorId:{type:graphql.GraphQLNonNull(graphql.GraphQLInt)},
    author:{
      type:Author,
      resolve :(books)=>{ return authors.find(author=>author.id==books.id)} // relation entre deux table
    }
  }),
})
const Author=new GraphQLObjectType({ //objet de type book
  name :"author",
  fields : ()=>({
    id:{type:graphql.GraphQLNonNull(graphql.GraphQLInt)},
    name:{type:graphql.GraphQLNonNull(graphql.GraphQLString)},
    book:{
      type:Author,
      resolve:(authors)=>{return books.filter((book)=>book.authorId==authors.id)}
    }
  }),
})
const rootquery=new  GraphQLObjectType({  // function get
  name:"query",
  fields :()=>({
    books:{
      type: new graphql.GraphQLList(Book),
      resolve:()=>books
    },
    authors:{
      type: new graphql.GraphQLList(Author),
      resolve:()=>authors
    },
    book:{  //get by id
      type:Book,
      args:
      {id:{type:graphql.GraphQLInt}},
      resolve :(parent,args)=> books.find((book)=>book.id==args.id) 
    },
    auth:{  //get by id
      type:Author,
      args:
      {id:{type:graphql.GraphQLInt}},
      resolve :(parent,args)=> authors.find((auth)=>auth.id==args.id) 
    }
   })})
   const ajout= new GraphQLObjectType({
    name:"ajout",
    fields:()=>({
      addbook:{
        type:Book,
        args:{
          name:{type:graphql.GraphQLString},
          authorId:{type:graphql.GraphQLInt}
        },
        resolve:(parent,args)=>{
          const book={id:books.length+1, name:args.name,authorId:args.authorId}
          books.push(book)
          return book
        }
      },
      addauth:{
        type:Author,
        args:{
          name:{type:graphql.GraphQLString}
        },
        resolve:(parent,args)=>{
          const author={id:authors.length+1, name:args.name}
          books.push(author)
          return author
        }
      },
      updatebook:{
        type:Book,
        args:{
          id:{type:graphql.GraphQLInt},
          name:{type:graphql.GraphQLString}
        },
        resolve:(parent,args)=>{
         let  auth=authors.find((auth)=>auth.id==args.id) ;
         console.log(auth)
         if (!auth) {
          throw new Error(`Couldn't find author with id ${args.id}`);
        }
        auth.name=args.name
        return auth
        }},
        updatauth:{
          type:Author,
          args:{
            id:{type:graphql.GraphQLInt},
            name:{type:graphql.GraphQLString},
            authorId:{type:graphql.GraphQLInt}
          },
          resolve:(parent,args)=>{
           let  book=books.find((book)=>book.id==args.id) ;
           console.log(book)
           if (!book) {
            throw new Error(`Couldn't find author with id ${args.id}`);
          }
          book.name=args.name
          book.authorId=args.authorId
          return book
          }},
        deletebook:{
          type:Book,
          args:{
            id:{type:graphql.GraphQLInt}
          },
          resolve:(parent,args)=>{
           let  book=books.find((book)=>book.id==args.id) ;
           console.log(book)
           if (!book) {
            throw new Error(`Couldn't find author with id ${args.id}`);
          }
        let x=books.indexOf(book)
        delete books[x]
        return book
          }},
          deleteauth:{
            type:Author,
            args:{
              id:{type:graphql.GraphQLInt}
            },
            resolve:(parent,args)=>{
             let  auth=authors.find((auth)=>auth.id==args.id) ;
             console.log(auth)
             if (!auth) {
              throw new Error(`Couldn't find author with id ${args.id}`);
            }
          let x=authors.indexOf(auth)
          delete authors[x]
          return auth
            }}
    })
   })
// const schema = new GraphQLSchema({
//   query: new GraphQLObjectType({
//     name: 'test',
//     fields: {
//       hello: {
//         type: GraphQLString,
//         resolve() {
//           return 'world'
//         },
//       },
//     },
//   }),
// })
 const schema=new GraphQLSchema({
   query:rootquery,
   mutation:ajout
 })
app.use('/graphql', graphqlHTTP({
  schema :schema,
  graphiql: true,
}),);
app.listen(5000,()=>console.log("run serveur"))

// import { SpatialTreeNode } from 'src/app/models/spatial-tree-node';
// import { findAllNodesInPath } from './spatial-utils';

// fdescribe('Test: Spatial Utilities', () => {
//   const tree: SpatialTreeNode = {
//     nodeId: '1',
//     children: [
//       {
//         nodeId: '2',
//         children: [
//           {
//             nodeId: '3',
//             children: [
//               {
//                 nodeId: '4',
//               },
//               {
//                 nodeId: '5',
//               },
//             ],
//           },
//         ],
//       },
//       {
//         nodeId: '6',
//         children: [
//           {
//             nodeId: '7',
//             children: [
//               {
//                 nodeId: '8',
//                 children: [
//                   {
//                     nodeId: '9',
//                   },
//                   {
//                     nodeId: '10',
//                   },
//                 ],
//               },
//               {
//                 nodeId: '11',
//                 children: [
//                   {
//                     nodeId: '12',
//                   },
//                 ],
//               },
//             ],
//           },
//         ],
//       },
//     ],
//   };

//   [
//     {find: '1', expectedPath: ['1']},
//     {find: '6', expectedPath: ['1', '6']},
//     {find: '3', expectedPath: ['1','2','3']},
//     {find: '5', expectedPath: ['1','2', '3', '5']},
//     {find: '9', expectedPath: ['1','6','7', '8', '9']},
//     {find: 'not-in-tree', expectedPath: []}
//   ].forEach(testCase => {
//     it(`finds the correct path ${testCase.find}: ${testCase.expectedPath.toString()}`, () => {
//       const path = [];
//       const found = findAllNodesInPath(tree, (node) => node.nodeId === testCase.find, path);
//       expect(found).toEqual(testCase.expectedPath.length > 0);
//       expect(path.map((p) => p.nodeId)).toEqual(testCase.expectedPath);
//     });
//   });  
// });

import React, {useRef, useEffect } from 'react'

const Canvas = props => {
    
    //used to access the canvas
    const canvasRef = useRef(null)

    useEffect(() =>{
    const canvas = canvasRef.current

    const context = canvas.getContext('2d')
    
        //drawing
        context.fillStyle = '#3465ea'
        context.fillRect(0,0,context.canvas.width, context.canvas.height)

        //drawing a line
        context.fillStyle = 'none'
        //define new path
        context.beginPath();
        //set a start point
        context.moveTo(0,0);
        //set an end point
        context.lineTo(200,100);
        //do the drawing
        context.stroke();
    },[])


    return <canvas ref={canvasRef} {...props}/>
}


export default Canvas


//GARBAGE vvvvvvvvvvvvvvvvv
// function drawLines(){
//                 const canvas = document.getElementById("myCanvas");
//                 const canvasContext = canvas.getContext("2d");

//                 {/* defining a new path*/}
//                 canvasContext.beginPath();
//                 {/*setting a start point*/}
//                 canvasContext.moveTo(0,0);
//                 {/*end-point*/}
//                 canvasContext.lineTo(200,100);
//                 {/*give it a stroke*/}
//                 canvasContext.stroke();
//                 return;
// }


// //making the function that will dislpay the island + connections
// function ConnectionLines(){

//     console.log("hi");

//     return( 
//         <div>
//             <h1>Connections wow!</h1>

//             <canvas id= "myCanvas" width="200" height="100">
//                 Sorry, your browser does not support canvas.
//             </canvas>


//             {/*drawing the line on the canvas*/}
//             drawLines();


//             <p>test</p>
//         </div>

//     )
// }


// export default ConnectionLines;

import React, {useRef, useEffect } from 'react'

const Canvas = props => {
    
    //used to access the canvas
    const canvasRef = useRef(null)

    useEffect(() =>{
    const canvas = canvasRef.current

    const context = canvas.getContext('2d')

    //line start and end
    let xLineStart = 0
    let yLineStart = 0
    let xLineEnd = 500
    let yLineEnd = 400

    let steps = 15
    
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
        context.lineTo(xLineEnd,yLineEnd);
        //do the drawing
        context.stroke();

        drawTriangleLine();

        function drawTriangleLine(){
            let distance = calculateLineLength();
            let i = distance/steps;
            for(let j=0;j < steps; j++){
                drawTriangle(context, (i*j*Math.abs(xLineEnd - xLineStart))/distance ,(i *j* Math.abs(yLineEnd - yLineStart))/distance )
            }
        }

        function calculateLineLength(){
            let distance = Math.sqrt((xLineEnd - xLineStart)**2 + (yLineEnd - yLineStart)**2)
            return distance;
        }

        function calculateDegrees(){
            let distance = calculateLineLength();
            let degrees = Math.sin(Math.abs(yLineEnd - yLineStart)/distance)*100;
            console.log(degrees);
            //let degrees = 40;
            return degrees
        }

        function drawTriangle(context, xCenterPoint, yCenterPoint){
            context.beginPath();
            context.moveTo(rotatePoint(xCenterPoint + 20, yCenterPoint, xCenterPoint, yCenterPoint)[0], rotatePoint(xCenterPoint + 20, yCenterPoint, xCenterPoint, yCenterPoint)[1] );
            context.lineTo(rotatePoint(xCenterPoint + 9, yCenterPoint +8, xCenterPoint, yCenterPoint)[0], rotatePoint(xCenterPoint + 9, yCenterPoint +8, xCenterPoint, yCenterPoint)[1]);
            context.lineTo(rotatePoint(xCenterPoint + 9, yCenterPoint -8, xCenterPoint, yCenterPoint)[0], rotatePoint(xCenterPoint + 9, yCenterPoint -8, xCenterPoint, yCenterPoint)[1]);
            context.lineTo(rotatePoint(xCenterPoint + 20, yCenterPoint, xCenterPoint, yCenterPoint)[0], rotatePoint(xCenterPoint + 20, yCenterPoint, xCenterPoint, yCenterPoint)[1]);
            context.stroke();
            console.log("trianle");
        }

      
        function rotatePoint(x, y, centerx, centery) {
            console.log('hey');
            let degrees = calculateDegrees();
            var newx = (x - centerx) * Math.cos(degrees * Math.PI / 180) - (y - centery) * Math.sin(degrees * Math.PI / 180) + centerx;
            var newy = (x - centerx) * Math.sin(degrees * Math.PI / 180) + (y - centery) * Math.cos(degrees * Math.PI / 180) + centery;
            return [newx, newy];
        }
        
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

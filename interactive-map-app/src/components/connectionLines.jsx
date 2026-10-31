
//idk why but the component template was messing up the code
//so it is gone now

//define a curve
export default function CurvedLineOfImages({
    start = { x: 20, y: 150 },
    control = { x: 160, y: 0 },
    end = { x: 300, y: 150 },
    src = "/arrow.svg",
    spacing = 20,
    imgSize = 16,
    alt = "Line icon",
}) {

        //will find a point on a quadratic bezier curve
        //t is from 0 to 1
        function pointAt(t){
            const reverseT = 1-t;
            return{
                x: reverseT * reverseT * start.x + 2 * reverseT * t * control.x + t * t * end.x,
                y: reverseT * reverseT * start.y + 2 * reverseT * t * control.y + t * t * end.y,
            }
        }

     //how many steps until next image is placed
     const steps = 200;
     //map of point locations (where each image is placed)
     const items = []

     //keeps track of how far we've travelled on the line
     let travelled = 0;
     //keeps track of where the next image goes
     let nextMark = 0;


     for (let i = 0; i < steps; i++){
        const currentLocation = pointAt(i/steps);
        const nextLocation = pointAt((i+1)/steps);

        //if we have reached a spot where we need to place an image
        if (travelled >= nextMark){
            //add a point to the items map
            items.push({
                x: currentLocation.x,
                y: currentLocation.y,
                //gets the direction of the curve
                angle: (Math.atan2(nextLocation.y - currentLocation.y, nextLocation.x - currentLocation.x)*180) / Math.PI,
            });
            //setting the next spot to put on image
            nextMark += spacing;
        }

        travelled += Math.hypot(nextLocation.x - currentLocation.x, nextLocation.y - currentLocation.y);

     }

    return <div>
        {items.map(function (currentItem, index){
            return (
                <img
                key = {index}
                src={src}
                width={imgSize}
                height = {imgSize}
                alt = {alt}
                //affects style to place it nicely
                style = {{
                    position: "absolute",
                    left: currentItem.x - imgSize/2,
                    top: currentItem.y - imgSize / 2,
                    transform: `rotate(${currentItem.angle}deg)`,
                }}
                />
            );
        })}
    </div>
}


/// GARBAGE vvvvvvvvvvvvvvvvvvvvvvvTRY 2
 
    // //used to access the canvas
    // const canvasRef = useRef(null)

    // useEffect(() =>{
    // const canvas = canvasRef.current

    // const context = canvas.getContext('2d')

    // //line start and end
    // let xLineStart = 0
    // let yLineStart = 0
    // let xLineEnd = 500
    // let yLineEnd = 400

    // let steps = 15
    
    //     //drawing
    //     context.fillStyle = '#3465ea'
    //     context.fillRect(0,0,context.canvas.width, context.canvas.height)

    //     //drawing a line
    //     context.fillStyle = 'none'
    //     //define new path
    //     context.beginPath();
    //     //set a start point
    //     context.moveTo(0,0);
    //     //set an end point
    //     context.lineTo(xLineEnd,yLineEnd);
    //     //do the drawing
    //     context.stroke();

    //     drawTriangleLine();

    //     function drawTriangleLine(){
    //         let distance = calculateLineLength();
    //         let i = distance/steps;
    //         for(let j=0;j < steps; j++){
    //             drawTriangle(context, (i*j*Math.abs(xLineEnd - xLineStart))/distance ,(i *j* Math.abs(yLineEnd - yLineStart))/distance )
    //         }
    //     }

    //     function calculateLineLength(){
    //         let distance = Math.sqrt((xLineEnd - xLineStart)**2 + (yLineEnd - yLineStart)**2)
    //         return distance;
    //     }

    //     function calculateDegrees(){
    //         let distance = calculateLineLength();
    //         let degrees = Math.sin(Math.abs(yLineEnd - yLineStart)/distance)*100;
    //         console.log(degrees);
    //         //let degrees = 40;
    //         return degrees
    //     }

    //     function drawTriangle(context, xCenterPoint, yCenterPoint){
    //         context.beginPath();
    //         context.moveTo(rotatePoint(xCenterPoint + 20, yCenterPoint, xCenterPoint, yCenterPoint)[0], rotatePoint(xCenterPoint + 20, yCenterPoint, xCenterPoint, yCenterPoint)[1] );
    //         context.lineTo(rotatePoint(xCenterPoint + 9, yCenterPoint +8, xCenterPoint, yCenterPoint)[0], rotatePoint(xCenterPoint + 9, yCenterPoint +8, xCenterPoint, yCenterPoint)[1]);
    //         context.lineTo(rotatePoint(xCenterPoint + 9, yCenterPoint -8, xCenterPoint, yCenterPoint)[0], rotatePoint(xCenterPoint + 9, yCenterPoint -8, xCenterPoint, yCenterPoint)[1]);
    //         context.lineTo(rotatePoint(xCenterPoint + 20, yCenterPoint, xCenterPoint, yCenterPoint)[0], rotatePoint(xCenterPoint + 20, yCenterPoint, xCenterPoint, yCenterPoint)[1]);
    //         context.stroke();
    //         console.log("trianle");
    //     }

      
    //     function rotatePoint(x, y, centerx, centery) {
    //         console.log('hey');
    //         let degrees = calculateDegrees();
    //         var newx = (x - centerx) * Math.cos(degrees * Math.PI / 180) - (y - centery) * Math.sin(degrees * Math.PI / 180) + centerx;
    //         var newy = (x - centerx) * Math.sin(degrees * Math.PI / 180) + (y - centery) * Math.cos(degrees * Math.PI / 180) + centery;
    //         return [newx, newy];
    //     }
        
    // },[])

//GARBAGE vvvvvvvvvvvvvvvvv TRY 1
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

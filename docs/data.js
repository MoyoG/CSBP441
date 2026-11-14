window.COURSE_DATA = {
  1: {
    short: "Foundations",
    title: "Computer Vision Foundations",
    summary: "Understand what computer vision tries to infer, why pixels are not meaning, and how real systems connect visual input to decisions.",
    image: "assets/ln1.png",
    objectives: [
      "Explain the semantic gap between pixel measurements and scene meaning.",
      "Recognize viewpoint, illumination, occlusion, clutter, and intraclass variation.",
      "Map a practical application into input, processing, output, and decision stages.",
      "Distinguish recognition, reconstruction, generation, and vision-language tasks."
    ],
    concepts: [
      ["The semantic gap", "A camera measures intensities. A useful system must connect those values to objects, relationships, events, and actions."],
      ["Appearance variation", "The same object can produce very different images when viewpoint, lighting, scale, pose, or occlusion changes."],
      ["Task and output", "A vision problem becomes concrete only when its required output is specified: a label, box, mask, trajectory, geometry, or generated image."],
      ["Robustness", "High benchmark accuracy does not guarantee reliable behavior for unusual scenes, rare arrangements, or shifted data."],
      ["Modern progress", "Learning algorithms, large datasets, GPUs, reusable models, and open tools jointly accelerated computer vision."],
      ["System interpretation", "A complete solution includes sensing, preprocessing, inference, postprocessing, and a decision or action."],
    ],
    handsOn: [
      ["Observe", "Choose one everyday scene and list what a human understands immediately."],
      ["Measure", "Describe what the camera actually records: pixels, channels, resolution, and time."],
      ["Specify", "Choose the exact machine output needed for one useful decision."],
      ["Stress-test", "Change viewpoint, lighting, clutter, or occlusion and predict the failure mode."],
    ],
    notebooks: [
      ["Image basics and first pipeline", "Grayscale conversion, brightness, thresholding, and result interpretation.", "LN1_Image_Basics.ipynb"],
    ],
    mcqs: [
      {q:"Which statement best describes a central goal of computer vision?",options:["Compress every image into the smallest file","Convert visual data into meaningful descriptions or decisions","Replace all cameras with depth sensors","Guarantee that every image has the same illumination"],answer:1,why:"Computer vision connects visual measurements such as pixels to useful meaning, descriptions, or actions."},
      {q:"What does the semantic gap describe?",options:["The difference between two camera focal lengths","The difference between training and testing accuracy","The difference between low-level visual data and high-level meaning","The physical space between two objects"],answer:2,why:"The semantic gap separates pixel-level representations from the concepts humans assign to a scene."},
      {q:"A camera moves around a stationary chair and almost every pixel changes. Which challenge does this illustrate?",options:["Occlusion","Viewpoint variation","Background clutter","Fine-grained recognition"],answer:1,why:"Viewpoint variation changes the projected appearance even though the object identity remains the same."},
      {q:"Images of dogs from many breeds, sizes, and poses belong to one class. This is an example of:",options:["Intraclass variation","Image quantization","Radial distortion","Binary segmentation"],answer:0,why:"Intraclass variation refers to appearance differences among examples of the same category."},
      {q:"Distinguishing a Maine Coon from a Ragdoll cat mainly illustrates which challenge?",options:["Image compression","Fine-grained categorization","Background subtraction","Camera calibration"],answer:1,why:"Fine-grained categorization separates visually similar subcategories within a broader class."},
      {q:"A partially hidden pedestrian is difficult to recognize primarily because of:",options:["Occlusion","Sampling","Magnification","Color quantization"],answer:0,why:"Occlusion hides part of the object and removes visual evidence needed for recognition."},
      {q:"Which combination most directly contributed to recent progress in computer vision?",options:["Smaller datasets and slower processors","Deep learning, large datasets, GPUs, and open-source frameworks","Eliminating mathematical models","Using only hand-drawn images"],answer:1,why:"Modern progress reflects improved learning methods, compute, data, reusable models, and software frameworks."},
      {q:"Which application estimates three-dimensional scene structure from images?",options:["Image classification","3D reconstruction","Style transfer","Binary thresholding"],answer:1,why:"3D reconstruction estimates scene geometry using one or more images."},
      {q:"Which task combines vision and language?",options:["Image captioning","Median filtering","Lens calibration","Histogram equalization"],answer:0,why:"Image captioning converts image content into a natural-language description."},
      {q:"What is the main lesson of unusual-object examples such as the Elephant in the Room demonstration?",options:["Modern detectors always interpret scenes like humans","High accuracy on common data does not guarantee robust understanding of unusual scenes","Object detection no longer requires data","Viewpoint variation has been completely solved"],answer:1,why:"A system can perform well on familiar benchmarks and still fail in unusual contexts or arrangements."}
    ],
    trueFalse: [
      {q:"Computer vision includes tasks beyond naming objects, such as matching, action understanding, reconstruction, and image generation.",answer:true,why:"Computer vision includes recognition, matching, actions, reconstruction, editing, and generation."},
      {q:"Viewpoint variation can change many pixels even when the physical object remains unchanged.",answer:true,why:"Changing camera pose changes the object's image projection."},
      {q:"Intraclass variation means that all examples within a category look nearly identical.",answer:false,why:"Intraclass variation describes appearance differences within the same category."},
      {q:"Background clutter can make object recognition more difficult.",answer:true,why:"Clutter makes the target harder to separate from surrounding visual patterns."},
      {q:"Occlusion occurs when part of an object is hidden from the camera.",answer:true,why:"Occlusion removes visible evidence needed for recognition or localization."},
      {q:"The semantic gap refers to the difference between pixel-level data and high-level meaning.",answer:true,why:"Computer vision attempts to bridge this representational gap."},
      {q:"Recent advances in computer vision resulted only from faster cameras.",answer:false,why:"Learning methods, GPUs, large datasets, frameworks, and reusable models also contributed."},
      {q:"Super-resolution attempts to recover or synthesize a higher-resolution image from a lower-resolution input.",answer:true,why:"Super-resolution is an image restoration and enhancement task."},
      {q:"Strong benchmark performance proves that a vision system will understand every unusual real-world scene.",answer:false,why:"Unusual contexts can expose failures that standard benchmarks do not measure."},
      {q:"Autonomous vehicles, robotics, and augmented reality are applications of computer vision.",answer:true,why:"Each uses visual data to support actions or interaction."}
    ],
    problemTypes: [["p01","1. From pixels to a vision decision"],["p04","4. Choose the required output"]]
  },
  2: {
    short: "Digital Images",
    title: "Images, Perception, and Vision Tasks",
    summary: "Treat an image as sampled, quantized data and connect image representations to classification, detection, segmentation, and tracking outputs.",
    image: "assets/ln2.jpg",
    objectives: [
      "Calculate intensity levels and uncompressed image storage.",
      "Interpret grayscale, binary, RGB, and video array shapes.",
      "Distinguish sampling from quantization.",
      "Match classification, localization, detection, segmentation, and tracking to their outputs."
    ],
    concepts: [
      ["Sampling", "Sampling chooses discrete spatial locations. More samples increase spatial resolution but also increase storage and computation."],
      ["Quantization", "Quantization maps measured intensity to a finite set of values. An unsigned 8-bit channel has 256 possible levels."],
      ["Color representation", "An RGB image stores three values per pixel. OpenCV normally loads them in BGR channel order."],
      ["Video", "A video adds a time dimension: a sequence of image frames from which motion and actions can be inferred."],
      ["Task hierarchy", "Classification labels an image; localization adds one location; detection finds instances; segmentation labels pixels; tracking links observations over time."],
      ["Hybrid pipelines", "Classical operations and learned models often coexist: normalize first, infer with a network, then clean or track predictions."],
    ],
    handsOn: [
      ["Inspect", "Print shape, dtype, minimum, maximum, and channel order for an image."],
      ["Transform", "Convert RGB to grayscale and compare what information is removed."],
      ["Threshold", "Apply two thresholds and measure how the foreground count changes."],
      ["Interpret", "Choose which task output would support a real decision."],
    ],
    notebooks: [["Image basics and thresholding", "A shared LN1-LN2 notebook for arrays, grayscale, brightness, and binary images.", "LN1_Image_Basics.ipynb"]],
    mcqs: [
      {q:"Which process converts a continuous scene into a digital image?",options:["Sampling and quantization","Rotation and translation","Detection and tracking","Training and validation"],answer:0,why:"Sampling discretizes spatial position, while quantization discretizes measured values."},
      {q:"What intensity range is normally available in an unsigned 8-bit grayscale image?",options:["0 to 1","0 to 7","0 to 255","-255 to 255"],answer:2,why:"Eight bits represent 256 values, conventionally numbered 0 through 255."},
      {q:"How is a standard RGB image represented?",options:["One binary channel","Three color channels","Two depth channels","A list of object names only"],answer:1,why:"RGB images store separate red, green, and blue channel values at each pixel."},
      {q:"Which retinal cells mainly support vision at low light levels and brightness perception?",options:["Cones","Rods","Pixels","Apertures"],answer:1,why:"Rods are highly light-sensitive and mainly support brightness and low-light vision."},
      {q:"Which ordering best represents a practical computer vision pipeline?",options:["Decision, input, preprocessing, algorithm","Input, preprocessing, algorithm, postprocessing, decision","Algorithm, camera, label, input","Postprocessing, decision, input, preprocessing"],answer:1,why:"A practical pipeline acquires data, prepares it, applies an algorithm, refines the result, and supports a decision."},
      {q:"When is a classical computer vision method especially attractive?",options:["When the visual rule is clear and interpretability matters","Only when unlimited labeled data are available","When intermediate results must remain hidden","Only for language generation"],answer:0,why:"Classical methods are often efficient and interpretable when the visual rule can be specified directly."},
      {q:"What is the typical output of image classification?",options:["A class label for the image","A trajectory for every object","A depth value for every pixel","A camera intrinsic matrix"],answer:0,why:"Image classification assigns one or more category labels to an image."},
      {q:"How does object localization extend image classification?",options:["It also estimates where the object is in the image","It removes all colors","It converts video into audio","It guarantees the object is moving"],answer:0,why:"Localization predicts both the object category and its image location, commonly with a bounding box."},
      {q:"Which task assigns a semantic category to each image pixel?",options:["Image classification","Semantic segmentation","Image captioning","Camera calibration"],answer:1,why:"Semantic segmentation produces a dense pixel-level class map."},
      {q:"Which task aims to maintain object identities and positions across video frames?",options:["Quantization","Tracking","Color conversion","Super-resolution"],answer:1,why:"Tracking links detections over time to estimate trajectories and preserve identity."}
    ],
    trueFalse: [
      {q:"An unsigned 8-bit grayscale image can represent 256 intensity levels.",answer:true,why:"Eight bits encode values from 0 through 255."},
      {q:"A 1-bit image is a binary image with two possible values.",answer:true,why:"One bit represents two states, commonly 0 and 1."},
      {q:"A standard RGB image contains separate red, green, and blue channels.",answer:true,why:"Each RGB pixel stores three channel values."},
      {q:"Rods are the primary retinal cells for detailed color discrimination.",answer:false,why:"Cones support color vision; rods mainly support brightness and low-light vision."},
      {q:"A real vision system may combine classical processing and deep learning in one pipeline.",answer:true,why:"Hybrid systems often use classical preprocessing, learned inference, and postprocessing."},
      {q:"Preprocessing always occurs after the final decision in a computer vision pipeline.",answer:false,why:"Preprocessing prepares the input before the main algorithm."},
      {q:"Object localization normally predicts a location in addition to a class.",answer:true,why:"A bounding box or similar spatial output indicates where the object appears."},
      {q:"Semantic segmentation assigns only one label to the entire image.",answer:false,why:"Semantic segmentation assigns a category to each pixel."},
      {q:"A video is a temporal sequence of image frames.",answer:true,why:"Motion and actions can be inferred from changes across the frame sequence."},
      {q:"Multi-object tracking attempts to preserve identities across frames.",answer:true,why:"Tracking associates observations over time to form trajectories."}
    ],
    problemTypes: [["p02","2. Image statistics and thresholding"],["p03","3. Bits, levels, and storage"]]
  },
  3: {
    short: "Linear Algebra",
    title: "Linear Algebra and Transformations",
    summary: "Use vectors and matrices to measure direction, construct geometry, and compose scaling, rotation, translation, affine, and perspective transformations.",
    image: "assets/ln3.png",
    objectives: [
      "Compute vector norms, dot products, angles, projections, and cross products.",
      "Multiply matrices and reason about dimensions, determinants, and inverses.",
      "Represent translation with homogeneous coordinates.",
      "Apply and compose 2D geometric transformations in the correct order."
    ],
    concepts: [
      ["Dot product", "The dot product measures directional agreement: positive for similar directions, zero for perpendicular vectors, and negative for opposing directions."],
      ["Cross product", "In three dimensions, a × b is perpendicular to both vectors. In homogeneous geometry, the same algebra constructs lines and intersections."],
      ["Matrix action", "A matrix maps vectors to new vectors. Its columns show where the coordinate basis vectors move."],
      ["Homogeneous coordinates", "Adding a coordinate lets translation join scaling and rotation inside one matrix product."],
      ["Composition order", "The rightmost matrix acts first. Matrix multiplication is generally not commutative, so changing order changes the result."],
      ["Affine and perspective maps", "Affine maps preserve parallelism. Perspective maps additionally model convergence and require division by the final homogeneous coordinate."],
    ],
    handsOn: [
      ["Calculate", "Solve one vector or transformation example by hand."],
      ["Visualize", "Plot the original and transformed vectors or points."],
      ["Implement", "Apply the same matrix with NumPy or OpenCV."],
      ["Compare", "Explain numerical, visual, and order-dependent differences."],
    ],
    notebooks: [
      ["Linear algebra and transformations", "Vectors, matrices, scaling, rotation, translation, affine, and perspective examples.", "LN3_Transformations.ipynb"],
      ["Homogeneous cross products", "Interactive points, lines, incidence tests, and intersections.", "Homogeneous_Cross_Product.ipynb"],
    ],
    mcqs: [
      {q:"What is the Euclidean length of v=[-6,8]ᵀ?",options:["2","10","14","100"],answer:1,why:"The L2 norm is √((-6)²+8²)=√100=10."},
      {q:"Two nonzero vectors are orthogonal when:",options:["Their dot product is zero","Their cross product is zero","Their components are identical","Their L1 norms are equal"],answer:0,why:"A zero dot product means the cosine of their angle is zero, so the angle is 90 degrees."},
      {q:"The cross product a×b in three dimensions produces a vector that is:",options:["Parallel to both a and b","Perpendicular to both a and b","Always a unit vector","Equal to a+b"],answer:1,why:"The cross product is orthogonal to both inputs unless the result is the zero vector."},
      {q:"If A is 2×3 and B is 3×4, what is the size of AB?",options:["2×4","3×3","3×4","The product is undefined"],answer:0,why:"The inner dimensions match, and the output keeps the outer dimensions 2×4."},
      {q:"What does det(A)=0 imply for a square matrix A?",options:["A is an identity matrix","A has a unique inverse","A is singular","A preserves every length"],answer:2,why:"A zero determinant indicates collapsed dimension and no matrix inverse."},
      {q:"Why are homogeneous coordinates useful for planar translation?",options:["They allow translation to be represented by matrix multiplication","They remove the need for a coordinate system","They force all vectors to have unit length","They make matrix multiplication commutative"],answer:0,why:"Adding a homogeneous coordinate embeds translation into a larger linear matrix operation."},
      {q:"A 90-degree counterclockwise rotation maps the point (3,1) to:",options:["(1,3)","(-1,3)","(3,-1)","(-3,-1)"],answer:1,why:"The rotation rule (x,y)→(-y,x) gives (-1,3)."},
      {q:"Why can changing the order of geometric transformations change the final image?",options:["Matrix multiplication is generally not commutative","All transformations use different units","Rotation matrices cannot be multiplied","Homogeneous coordinates prohibit composition"],answer:0,why:"In general, AB and BA represent different transformation sequences and produce different results."},
      {q:"Which geometric property is preserved by an affine transformation?",options:["All lengths","All angles","Parallelism of lines","Perspective depth"],answer:2,why:"Affine transformations preserve straightness and parallelism, but not necessarily lengths or angles."},
      {q:"What is the minimum number of nondegenerate point correspondences required to estimate a planar perspective transform?",options:["Two","Three","Four","Eight"],answer:2,why:"A homography has eight independent scale-normalized parameters and requires four suitable point pairs."}
    ],
    trueFalse: [
      {q:"The L1 norm is the usual Euclidean length of a vector.",answer:false,why:"The L2 norm gives Euclidean length; the L1 norm sums absolute components."},
      {q:"If two nonzero vectors have a zero dot product, they are orthogonal.",answer:true,why:"A zero dot product corresponds to a 90-degree angle."},
      {q:"A nonzero cross product is perpendicular to both input vectors.",answer:true,why:"Orthogonality to both operands is a defining property of the 3D cross product."},
      {q:"Two matrices must have the same dimensions in order to be added.",answer:true,why:"Matrix addition operates entry by entry."},
      {q:"Matrix multiplication is commutative for all compatible matrices.",answer:false,why:"In general AB is not equal to BA, and one product may even be undefined."},
      {q:"A square matrix with determinant zero has an inverse.",answer:false,why:"A zero determinant means the matrix is singular."},
      {q:"Multiplication by the identity matrix leaves a compatible vector or matrix unchanged.",answer:true,why:"The identity matrix is the multiplicative identity."},
      {q:"A 2 × 2 linear transformation can move the origin to a nonzero point.",answer:false,why:"Every linear transformation maps the zero vector to itself; translation requires homogeneous coordinates."},
      {q:"Applying rotation and translation in opposite orders always gives the same result.",answer:false,why:"Transformation order matters because matrix multiplication is generally not commutative."},
      {q:"Affine transformations preserve parallel lines.",answer:true,why:"Parallelism is an affine invariant."}
    ],
    problemTypes: [
      ["p05","5. Vector magnitude, distance, and direction"],["p06","6. Dot product using cosine"],
      ["p07","7. Orthogonality and projection"],["p08","8. Three-dimensional cross product"],
      ["p09","9. Matrix dimensions and multiplication"],["p10","10. Determinant, inverse, and a linear system"],
      ["p11","11. Symmetric and skew-symmetric parts"],["p12","12. Images as arrays"],
      ["p21","21. Scaling and rotation"],["p22","22. Homogeneous translation"],
      ["p23","23. Transformation order"],["p24","24. Affine transformation of a triangle"],
      ["p25","25. Recover a simple affine map"]
    ]
  },
  4: {
    short: "Camera Models",
    title: "Camera Models and Projective Geometry",
    summary: "Connect 3D scene points to 2D pixels through pinhole projection, homogeneous lines, vanishing points, and camera parameters.",
    image: "assets/ln4.png",
    objectives: [
      "Project 3D camera-coordinate points onto an image plane.",
      "Explain how focal length and depth affect image position and size.",
      "Construct a line from two homogeneous points and an intersection from two lines.",
      "Distinguish intrinsic parameters, extrinsic parameters, and lens distortion."
    ],
    concepts: [
      ["Pinhole projection", "Image position depends on X/Z and Y/Z. Points on the same camera ray share a projection, so depth is lost."],
      ["Homogeneous incidence", "A point p lies on line l when lᵀp = 0. Cross products construct the vector satisfying two incidence constraints."],
      ["Vanishing points", "Parallel 3D lines can meet in the image because their shared direction projects to a point at infinity or a finite vanishing point."],
      ["Intrinsics", "Focal lengths, principal point, and skew describe how camera coordinates map to pixels."],
      ["Extrinsics", "Rotation and translation describe camera pose or the mapping from world coordinates to camera coordinates."],
      ["Lens effects", "Aperture controls light and depth of field; radial distortion bends image coordinates increasingly toward the edges."],
    ],
    handsOn: [
      ["Project", "Compute x=fX/Z and y=fY/Z for several 3D points."],
      ["Construct", "Use p₁ × p₂ for a line and l₁ × l₂ for an intersection."],
      ["Visualize", "Draw viewing rays, vanishing points, or depth-dependent image size."],
      ["Calibrate", "Interpret how K, R, t, and distortion change measured pixels."],
    ],
    notebooks: [
      ["Camera model and image formation", "Projection, depth, intrinsics, extrinsics, vanishing points, and radial distortion.", "LN4_Camera_Models.ipynb"],
      ["Homogeneous cross products", "Point-line duality and intersection visualizations.", "Homogeneous_Cross_Product.ipynb"],
    ],
    mcqs: [
      {q:"What is the main purpose of the small opening in a pinhole camera?",options:["To block most rays and reduce image blur","To increase radial distortion","To convert RGB into grayscale","To make every object the same size"],answer:0,why:"Restricting the rays reaching each image point reduces the overlap that would otherwise blur the image."},
      {q:"Under the lecture's pinhole convention, a 3D point (X,Y,Z) projects to:",options:["(-fX/Z,-fY/Z)","(fX,fY)","(X+f,Y+f)","(X/Z²,Y/Z²)"],answer:0,why:"Under the stated sign convention, similar triangles give coordinates proportional to focal length and inversely proportional to depth."},
      {q:"Why is perspective projection not one-to-one?",options:["Different 3D points on the same viewing ray can project to the same image point","Every image point has a different color","The camera records only parallel rays","The focal length is always zero"],answer:0,why:"Projection loses depth along a viewing ray, so multiple scene points can share an image location."},
      {q:"A set of parallel 3D lines with the same direction generally projects to:",options:["Concentric circles","Lines meeting at a vanishing point","A single image pixel","Parallel image rows in every camera pose"],answer:1,why:"Parallel scene lines generally project to image lines meeting at a direction-dependent vanishing point."},
      {q:"Which homogeneous image points represent the same Cartesian point?",options:["(2,4,2) and (1,2,1)","(2,4,2) and (2,4,1)","(1,2,0) and (1,2,1)","(0,0,0) and (1,1,1)"],answer:0,why:"Nonzero homogeneous vectors that differ by a common scale represent the same point."},
      {q:"Given homogeneous line vectors l₁ and l₂, their intersection point is computed by:",options:["l₁+l₂","l₁·l₂","l₁×l₂","l₁/l₂"],answer:2,why:"The cross product produces a point vector satisfying both line equations."},
      {q:"Which item is an intrinsic camera parameter?",options:["Camera position in the world","Camera orientation in the world","Focal length","World-coordinate origin"],answer:2,why:"Focal length belongs to internal calibration; position and orientation are extrinsic parameters."},
      {q:"What usually happens when the aperture becomes smaller?",options:["More light enters and depth of field decreases","Less light enters and depth of field increases","Focal length becomes zero","Radial distortion always disappears"],answer:1,why:"A smaller aperture admits less light but increases the range of depths that appear acceptably focused."},
      {q:"Where is radial lens distortion usually most noticeable?",options:["Near the optical axis only","Near the image edges","Only at the principal point","Equally at every pixel"],answer:1,why:"Radial distortion generally increases with distance from the optical axis."},
      {q:"For a fixed sensor size, which change generally gives a wider field of view?",options:["Increasing focal length","Decreasing focal length","Increasing object depth only","Changing image brightness"],answer:1,why:"A shorter focal length captures a wider angular field of view."}
    ],
    trueFalse: [
      {q:"A pinhole camera reduces blur by blocking most rays from reaching the image plane.",answer:true,why:"The aperture restricts the pencil of rays contributing to each image location."},
      {q:"Perspective projection uniquely preserves the depth of every 3D point.",answer:false,why:"Depth is lost because points on one viewing ray can share an image projection."},
      {q:"In perspective projection, image coordinates are inversely related to scene depth Z.",answer:true,why:"The projected coordinates contain the ratios X/Z and Y/Z."},
      {q:"Any two image lines that meet must correspond to parallel lines in the 3D world.",answer:false,why:"Converging image lines can arise from many 3D configurations."},
      {q:"The homogeneous points (x,y,w) and (kx,ky,kw), for nonzero k, represent the same point.",answer:true,why:"Homogeneous coordinates are defined only up to a nonzero scale."},
      {q:"A homogeneous point with w=0 represents a point at infinity.",answer:true,why:"Points with w=0 encode directions and parallel-line intersections."},
      {q:"Homogeneous coordinates allow translation to be written as matrix multiplication.",answer:true,why:"The added coordinate makes affine translation linear in the augmented space."},
      {q:"Camera position and orientation are intrinsic parameters.",answer:false,why:"Position and orientation are extrinsic; focal length and principal point are intrinsic."},
      {q:"A smaller aperture generally increases depth of field but reduces the amount of light entering the camera.",answer:true,why:"This is the central aperture tradeoff."},
      {q:"Radial distortion is usually strongest at the principal point and weakest near the image edges.",answer:false,why:"Radial distortion is generally more noticeable farther from the optical axis."}
    ],
    problemTypes: [
      ["p13","13. Point cross point gives a line"],["p14","14. Line through two points"],
      ["p15","15. Line-point incidence test"],["p16","16. Line cross line gives the intersection"],
      ["p17","17. Parallel lines and a point at infinity"],["p18","18. Equivalent homogeneous points"],
      ["p19","19. Why the cross product works"],["p20","20. Planes behind homogeneous line vectors"],
      ["p26","26. Perspective transform and homogeneous division"],["p27","27. Pinhole projection"],
      ["p28","28. Projection matrix with camera intrinsics"],["p29","29. Depth and magnification"],
      ["p30","30. Extrinsic translation before projection"]
    ]
  },
  5: {
    short: "Filtering",
    title: "Image Operations and Spatial Filtering",
    summary: "Calculate point operations and neighborhood filters, compare boundary conditions, test linearity, and connect derivatives to image edges.",
    image: "assets/ln5.png",
    objectives: [
      "Apply brightness, contrast, threshold, and grayscale point operations.",
      "Calculate valid and same-size correlation outputs by hand.",
      "Compare zero, replicate, symmetric, and circular padding.",
      "Explain Gaussian smoothing, median filtering, LSI systems, and derivative responses."
    ],
    concepts: [
      ["Point operations", "Each output pixel depends only on its corresponding input pixel. Examples include brightness, contrast, thresholding, and color conversion."],
      ["Spatial filtering", "A kernel combines a local neighborhood to produce one output value. The kernel determines smoothing, sharpening, shifting, or differentiation."],
      ["Correlation and convolution", "Correlation keeps the kernel orientation; convolution flips it before sliding. Symmetric kernels make both outputs identical."],
      ["Padding", "Boundary rules create missing neighbors. Zero, replicate, symmetric, and circular padding can produce very different corner values."],
      ["Linear shift invariance", "An LSI filter obeys superposition and responds to a shifted input with an equally shifted output."],
      ["Robust smoothing and edges", "Gaussian filters average with distance-based weights; median filters suppress isolated outliers; derivatives respond to intensity transitions."],
    ],
    handsOn: [
      ["Calculate", "Multiply a 3 × 3 patch and kernel element by element."],
      ["Compare", "Repeat the corner calculation under three boundary rules."],
      ["Verify", "Check the result with a short NumPy implementation."],
      ["Interpret", "Decide whether the response represents smoothing, an edge, or an outlier."],
    ],
    notebooks: [
      ["Image and filtering examples", "Complete LN5 notebook covering representation, noise, filters, padding, Gaussian kernels, median filters, and derivatives.", "LN5_Image_and_Filtering.ipynb"],
      ["LSI hands-on lab", "Impulse response, convolution, linearity, shift invariance, and median nonlinearity.", "LSI_Hands_On.ipynb"],
    ],
    mcqs: [
      {q:"Which statement correctly distinguishes sampling from quantization?",options:["Sampling discretizes position; quantization discretizes intensity","Sampling discretizes intensity; quantization discretizes position","Both operations only change color","Neither operation is part of digitization"],answer:0,why:"Sampling acts on the spatial domain, while quantization acts on the value range."},
      {q:"Which noise model randomly replaces some pixels with very dark or very bright values?",options:["Gaussian noise","Salt-and-pepper noise","Radial distortion","Perspective noise"],answer:1,why:"Salt-and-pepper noise produces sparse black and white outliers."},
      {q:"What characterizes a point-processing operation?",options:["Each output pixel depends only on the corresponding input pixel","Each output pixel requires the entire video","It always uses a 7×7 kernel","It must be nonlinear"],answer:0,why:"Point processing maps each intensity independently and does not inspect neighboring pixels."},
      {q:"What distinguishes image filtering from point processing?",options:["Filtering combines values from a local neighborhood","Filtering cannot change an image","Filtering operates only on text","Filtering always produces a binary image"],answer:0,why:"A spatial filter computes each output from a neighborhood around the current position."},
      {q:"A 3-sample averaging filter is applied to [9,10,12]. What is the output?",options:["9.00","10.00","10.33","12.00"],answer:2,why:"The average is (9+10+12)/3=31/3=10.33."},
      {q:"With no padding, what is the valid output size when a 3×3 kernel is applied to a 5×6 image?",options:["5×6","3×4","7×8","2×3"],answer:1,why:"Valid filtering gives (5−3+1)×(6−3+1)=3×4."},
      {q:"How does convolution differ from cross-correlation?",options:["Convolution flips the kernel before sliding it","Cross-correlation always uses a median","Convolution cannot use padding","Cross-correlation is always nonlinear"],answer:0,why:"Cross-correlation keeps the kernel orientation, whereas convolution reverses it in each spatial dimension."},
      {q:"Which two properties define an LSI system?",options:["Linearity and shift invariance","Brightness and contrast","Sampling and quantization","Rotation and scaling"],answer:0,why:"An LSI system obeys superposition and responds identically to the same pattern at shifted locations."},
      {q:"A practical Gaussian kernel width is commonly chosen to cover approximately:",options:["One standard deviation","Two standard deviations total","Six standard deviations total","The image width regardless of sigma"],answer:2,why:"A width near 6σ captures about 99.7 percent of the Gaussian distribution."},
      {q:"Which filter is usually most robust to isolated salt-and-pepper outliers?",options:["Median filter","Large positive gain","Identity filter","First derivative only"],answer:0,why:"The median depends on order rather than the magnitude of extreme values."}
    ],
    trueFalse: [
      {q:"Sampling discretizes the spatial domain of an image.",answer:true,why:"Sampling selects discrete spatial positions from a continuous image function."},
      {q:"Quantization discretizes the range of possible intensity values.",answer:true,why:"Quantization maps measured values into a finite set."},
      {q:"The additive noise model can be written as I_observed = I_original + n.",answer:true,why:"The observed value equals the true value plus a noise term in the additive model."},
      {q:"Averaging multiple images of the same still scene can reduce independent random noise.",answer:true,why:"Random fluctuations tend to cancel while fixed scene content reinforces."},
      {q:"A spatial filter computes each output pixel using a neighborhood of input pixels.",answer:true,why:"The kernel defines how neighborhood values contribute to the output."},
      {q:"Cross-correlation flips the kernel in both spatial directions before applying it.",answer:false,why:"Convolution flips the kernel; cross-correlation retains its orientation."},
      {q:"Convolution is commutative: f*g = g*f.",answer:true,why:"Commutativity is a standard convolution property."},
      {q:"The median filter is a linear filter.",answer:false,why:"Median selection does not satisfy superposition."},
      {q:"A separable M × M filter can reduce filtering cost by using two one-dimensional passes.",answer:true,why:"The two-pass method reduces work per pixel from order M² to order M."},
      {q:"A first-derivative filter gives its largest response in perfectly uniform image regions.",answer:false,why:"Uniform regions have nearly zero derivative; strong transitions produce large responses."}
    ],
    problemTypes: [
      ["p31","31. Brightness, contrast, and clipping"],["p32","32. Histogram and threshold"],
      ["p33","33. RGB to grayscale point operation"],["p34","34. Valid 2D cross-correlation"],
      ["p35","35. Boundary handling: zero and replicate"],["p36","36. Cross-correlation versus convolution"],
      ["p37","37. Gaussian separability and cost"],["p38","38. Median filtering and nonlinearity"],
      ["p39","39. Impulse response and 2D linearity"],["p40","40. Horizontal and vertical derivatives"],
      ["p41","41. Mean filter with three padding modes"],["p42","42. Gaussian filter with three padding modes"],
      ["p43","43. Derivative filter with three padding modes"],["filter","Flexible filter lab"]
    ]
  },
  6: {
    short: "Edge Detection",
    title: "Edge Detection and Boundary Analysis",
    summary: "Detect meaningful intensity transitions, compare first- and second-derivative methods, tune Canny, and justify edge-detection choices for a real image task.",
    image: "assets/ln5.png",
    objectives: [
      "Explain how gradients, magnitude, and direction describe image edges.",
      "Compare Roberts, Prewitt, Sobel, Scharr, Laplacian, LoG, DoG, and Canny.",
      "Select smoothing and threshold parameters from image evidence and task requirements.",
      "Implement and evaluate an edge-detection pipeline in OpenCV."
    ],
    concepts: [
      ["Gradient", "The first derivative measures local intensity change. Gx responds most strongly to vertical boundaries, Gy to horizontal boundaries, and gradient magnitude measures edge strength."],
      ["Smoothing before differentiation", "Noise produces large derivative responses. Gaussian smoothing reduces this sensitivity, but excessive smoothing can blur or shift fine boundaries."],
      ["First and second derivatives", "Sobel and Scharr use first derivatives. Laplacian, LoG, and DoG use second-derivative behavior, where sign changes help locate candidate edges."],
      ["Canny pipeline", "Canny combines smoothing, gradient estimation, non-maximum suppression, double thresholding, and hysteresis to produce thin and connected edge maps."],
      ["Evaluation", "A dense edge map is not necessarily better. Compare useful boundaries, missed boundaries, noise responses, localization, and the downstream task."],
      ["Deployment tradeoff", "Fixed small kernels are efficient, while larger smoothing kernels and multi-stage processing increase cost. The right choice depends on image scale, noise, and timing limits."]
    ],
    handsOn: [
      ["Measure", "Calculate Gx, Gy, magnitude, and direction for selected image neighborhoods."],
      ["Compare", "Run Sobel, Scharr, Laplacian, LoG, and Canny on the same image."],
      ["Tune", "Change Gaussian sigma and Canny thresholds, then record which boundaries improve or disappear."],
      ["Interpret", "Explain one edge-detection failure and propose a practical correction for the target application."]
    ],
    recap: "Edge detection converts local intensity change into boundary evidence. A reliable pipeline balances noise suppression, localization, continuity, and computational cost; its quality must be judged against the image content and the downstream task, not by edge count alone.",
    takeaways: [
      "Gx and Gy are signed directional derivatives: Gx responds strongly to vertical boundaries and Gy to horizontal boundaries.",
      "Gradient magnitude measures edge strength, while atan2(Gy, Gx) gives the direction of greatest intensity increase; the visible edge tangent is perpendicular to that direction.",
      "Derivative operators amplify noise. Gaussian smoothing improves robustness, but excessive smoothing can weaken, merge, or shift fine boundaries.",
      "Prewitt provides a simple derivative estimate, Sobel adds perpendicular smoothing weights, and Scharr improves rotational accuracy for a 3 x 3 kernel.",
      "Laplacian and LoG are second-derivative methods. Candidate edges occur near zero crossings, but weak noise-driven sign changes should be rejected.",
      "The Canny sequence is Gaussian smoothing, gradient estimation, non-maximum suppression, double thresholding, and edge tracking by hysteresis.",
      "Non-maximum suppression compares magnitudes along the quantized gradient direction so a broad response becomes a thin boundary.",
      "The high Canny threshold identifies strong edges; the low threshold identifies weak candidates retained only when connected to a strong edge.",
      "Higher thresholds usually produce fewer edges, while stronger smoothing reduces noise at the cost of fine detail. Both choices must be validated on representative images.",
      "Evaluate useful-boundary precision and recall, localization, continuity, false texture responses, runtime, and downstream performance rather than preferring the densest edge map."
    ],
    notebooks: [
      ["Edge detection laboratory", "Upload an image and compare gradient, Laplacian, LoG, DoG, and Canny results with worked calculations.", "LN6_Edge_Detection.ipynb"]
    ],
    materials: [
      ["Lab 2: Full Canny edge-detection calculation", "A 75-minute team worksheet covering Gaussian smoothing, Sobel derivatives, magnitude, direction, non-maximum suppression, double thresholds, hysteresis, and computational cost.", "resources/Lab2_LN6_Canny_Edge_Detection_Student.docx"]
    ],
    mcqs: [
      {q:"What does a large gradient magnitude usually indicate?",options:["A uniformly bright region","A rapid local intensity change","A guaranteed object boundary","A zero crossing"],answer:1,why:"Gradient magnitude is large where intensity changes rapidly; that change may or may not be a meaningful object boundary."},
      {q:"For the usual Sobel convention, Gx responds most strongly to which boundary?",options:["A vertical boundary","A horizontal boundary","A circular boundary only","No boundary"],answer:0,why:"Gx differentiates from left to right, so it responds to intensity changes across a vertical boundary."},
      {q:"Why is Gaussian smoothing commonly applied before a derivative operator?",options:["It guarantees perfect edge localization","It reduces noise that derivatives would amplify","It converts every image to binary","It removes the need for thresholds"],answer:1,why:"Derivatives amplify small local fluctuations. Smoothing suppresses many noise-driven responses before differentiation."},
      {q:"Which property makes the Sobel operator less noise-sensitive than the simple [-1, 0, 1] derivative?",options:["It uses color channels","It includes smoothing weights in the perpendicular direction","It uses no convolution","It produces only positive values"],answer:1,why:"The [1, 2, 1] weighting perpendicular to the derivative averages nearby values."},
      {q:"What is the main purpose of non-maximum suppression in Canny edge detection?",options:["Increase edge thickness","Keep only local maxima along the gradient direction","Replace weak edges with strong edges","Calculate a Laplacian"],answer:1,why:"Non-maximum suppression thins a broad ridge of gradient responses to its local peak."},
      {q:"In Canny hysteresis, a weak edge is retained when it is:",options:["Below the low threshold","Connected to a strong edge","Brighter than the image mean","At the image border"],answer:1,why:"Hysteresis preserves weak pixels only when they connect to a strong-edge component."},
      {q:"Which detector most directly uses zero crossings to identify candidate edges?",options:["Sobel","Prewitt","Laplacian of Gaussian","Roberts"],answer:2,why:"LoG is a second-derivative method; a sign change around a location is its usual edge cue."},
      {q:"What is a likely consequence of increasing Gaussian sigma too much before edge detection?",options:["Less noise and sharper localization","More fine detail and no blur","Suppressed fine boundaries and poorer localization","No change in the edge map"],answer:2,why:"Large sigma removes noise but can merge, weaken, or displace fine boundaries."},
      {q:"Which change usually makes Canny return fewer edge pixels?",options:["Lowering both thresholds","Raising both thresholds","Removing non-maximum suppression","Increasing image contrast"],answer:1,why:"Higher thresholds require stronger gradient responses before a pixel can be accepted."},
      {q:"Which statement correctly interprets edge direction?",options:["Gradient direction normally runs along the boundary","Gradient direction normally points across the boundary","Direction is unrelated to Gx and Gy","All edges have direction 0 degrees"],answer:1,why:"The gradient points toward the greatest increase in intensity, which is perpendicular to the local edge tangent."},
      {q:"Why can an edge map with more detected pixels be worse?",options:["More pixels always reduce memory","Extra pixels can represent noise, texture, or thick duplicate responses","Edges must contain exactly one pixel","An edge map cannot contain texture"],answer:1,why:"Edge density alone is not quality; the map should retain useful boundaries while rejecting irrelevant responses."},
      {q:"What is the relationship between DoG and LoG?",options:["DoG is a practical approximation to scale-normalized LoG behavior","DoG is identical to a first derivative","LoG cannot be smoothed","They both require color images"],answer:0,why:"The difference of two Gaussian-blurred images approximates a Laplacian-of-Gaussian response at an appropriate scale."},
      {q:"A constant-intensity image is filtered with a derivative kernel whose coefficients sum to zero. What response is expected away from borders?",options:["A large positive response","A large negative response","Approximately zero","The original intensity"],answer:2,why:"Equal input values cancel under a zero-sum derivative kernel."},
      {q:"Which parameter choice best suits a noisy industrial inspection image when faint defects must be preserved?",options:["No smoothing and very high thresholds","Moderate smoothing with validated double thresholds","Maximum smoothing and zero thresholds","Any settings because thresholds never matter"],answer:1,why:"Moderate smoothing can control noise while carefully chosen low and high thresholds preserve faint but connected defect boundaries."},
      {q:"Which OpenCV function directly computes a Canny edge map?",options:["cv2.Canny","cv2.threshold","cv2.resize","cv2.addWeighted"],answer:0,why:"cv2.Canny implements the multi-stage Canny edge detector."},
      {q:"Why might Scharr be preferred over Sobel for a small 3 x 3 derivative kernel?",options:["It is designed for improved rotational symmetry and accuracy","It eliminates all noise without smoothing","It needs no gradient direction","It creates a segmentation mask directly"],answer:0,why:"Scharr modifies the 3 x 3 weights to improve derivative accuracy and rotational behavior."},
      {q:"What does a positive Gx response mean under the kernel [-1, 0, 1]?",options:["Intensity increases from left to right","Intensity decreases from left to right","The pixel is certainly an edge center","The image is binary"],answer:0,why:"The right side is positively weighted and the left side negatively weighted, so a brighter right side gives a positive response."},
      {q:"Which metric is most useful for comparing a predicted binary edge mask with a labeled edge mask?",options:["IoU or precision and recall","Image width only","Mean RGB color","File extension"],answer:0,why:"IoU, precision, and recall quantify overlap and the tradeoff between false and missed edges."},
      {q:"Which stage is unique to the standard Canny pipeline among the listed choices?",options:["Hysteresis thresholding","Image acquisition","Gaussian blur only","Pixel display"],answer:0,why:"Hysteresis links weak responses to strong edges using two thresholds and connectivity."},
      {q:"For fixed small kernels, how does edge-filtering work scale with the number of image pixels?",options:["Approximately linearly","Quadratically with image width only","Independently of image size","Exponentially"],answer:0,why:"A fixed-size kernel performs a constant amount of work per pixel, so total work is O(HW)."}
    ],
    trueFalse: [
      {q:"A bright pixel in a gradient-magnitude image always corresponds to a bright pixel in the original image.",answer:false,why:"A bright magnitude means a strong local change, not high original intensity."},
      {q:"Gx and Gy can have negative as well as positive values before magnitude is computed.",answer:true,why:"They are signed directional derivatives; the sign indicates the direction of intensity change."},
      {q:"Gradient magnitude can be computed as sqrt(Gx squared plus Gy squared).",answer:true,why:"This is the Euclidean magnitude of the two-component image gradient."},
      {q:"The gradient direction usually lies parallel to the visible edge boundary.",answer:false,why:"The gradient normally points across the boundary, perpendicular to the edge tangent."},
      {q:"Derivatives tend to amplify image noise.",answer:true,why:"Small intensity fluctuations can create relatively large derivative responses."},
      {q:"Sobel uses both differentiation and local smoothing weights.",answer:true,why:"Its kernel differentiates in one axis and applies [1, 2, 1] smoothing in the other."},
      {q:"A zero crossing in a Laplacian response should always be accepted as a real edge.",answer:false,why:"Small noisy sign changes need a contrast or magnitude condition before acceptance."},
      {q:"Canny uses two thresholds rather than one threshold.",answer:true,why:"Pixels are classified as strong, weak, or rejected before hysteresis."},
      {q:"A weak Canny response disconnected from all strong responses is normally rejected.",answer:true,why:"Hysteresis retains only weak pixels that connect to a strong edge."},
      {q:"Increasing Canny thresholds generally increases the number of detected edge pixels.",answer:false,why:"Higher thresholds are stricter and generally reduce accepted edges."},
      {q:"Non-maximum suppression helps make Canny boundaries thin.",answer:true,why:"It retains local gradient peaks and suppresses nearby non-peak responses."},
      {q:"Roberts, Prewitt, Sobel, and Scharr all approximate image derivatives using small kernels.",answer:true,why:"They use different finite-difference kernels to estimate local intensity change."},
      {q:"The sum of a first-derivative kernel is normally zero so that constant regions produce no response.",answer:true,why:"Positive and negative coefficients cancel when every neighborhood value is equal."},
      {q:"DoG is formed by adding two Gaussian-blurred images.",answer:false,why:"DoG subtracts responses obtained at two Gaussian scales."},
      {q:"More smoothing always improves an edge detector.",answer:false,why:"Excessive smoothing can erase or displace small, important boundaries."},
      {q:"For a fixed kernel size, filtering a 1024 x 1024 image requires about four times the work of a 512 x 512 image.",answer:true,why:"The larger image has four times as many pixels, so fixed-kernel work grows by about four."},
      {q:"A lower Canny threshold controls which pixels are initially classified as strong edges.",answer:false,why:"The high threshold defines strong edges; the low threshold defines weak candidates."},
      {q:"Edge detection alone identifies the semantic class of every object in an image.",answer:false,why:"Edges show local changes and boundaries, but they do not by themselves assign object meaning."},
      {q:"The best edge-detector settings can depend on noise, contrast, image scale, and the downstream task.",answer:true,why:"There is no universal threshold or sigma that is optimal for every image and application."},
      {q:"Overlaying detected edges on the original image changes the edge detector itself.",answer:false,why:"An overlay is a visualization of an already computed edge map."}
    ],
    problemTypes: [["edgecalc","Gradient calculation"],["canny","Canny threshold and hysteresis"]],
    problemBankLink: "ln6-problems.html"
  },
  7: {
    short: "Neural Networks",
    title: "Neural Networks for Image Classification",
    summary: "Build a classifier from an artificial neuron, understand nonlinear activations and loss, then train and evaluate a handwritten-digit model.",
    image: "assets/ln7.png",
    objectives: [
      "Calculate a neuron's weighted sum, bias, and activation.",
      "Explain why hidden layers need nonlinear activation functions.",
      "Use softmax and cross-entropy for multiclass classification.",
      "Train, validate, test, and diagnose a simple image classifier."
    ],
    concepts: [
      ["Artificial neuron", "A neuron calculates z = x dot w + b, then passes z through an activation function. Weights and biases are learned parameters."],
      ["Nonlinear activation", "Without nonlinear hidden activations, stacked affine layers collapse into one affine transformation and cannot represent nonlinear decisions such as XOR."],
      ["Softmax output", "Softmax converts ten digit scores into one probability distribution whose values lie between zero and one and sum to one."],
      ["Cross-entropy loss", "For one-hot labels, cross-entropy is minus the logarithm of the probability assigned to the correct class. Confident wrong predictions receive a large penalty."],
      ["Data splits", "Training data updates parameters, validation data guides model choices, and the test set measures final generalization after those choices are complete."],
      ["Evaluation and error analysis", "Accuracy summarizes overall correctness. Precision, recall, F1, confusion matrices, and representative mistakes reveal class-specific behavior."]
    ],
    handsOn: [
      ["Calculate", "Work through z = x dot w + b, sigmoid, softmax, and cross-entropy by hand."],
      ["Compare", "Plot activation functions and inspect how their derivatives affect learning."],
      ["Train", "Solve AND and XOR, then train a one-layer ten-class handwritten-digit classifier."],
      ["Diagnose", "Use learning curves, class metrics, a confusion matrix, and high-confidence mistakes to propose an improvement."]
    ],
    recap: "A neural network learns weights and biases from examples. Nonlinear activations create expressive hidden representations, while a task loss and optimizer provide the signal used to update the parameters.",
    takeaways: [
      "A neuron first computes z = x dot w + b and then applies an activation function.",
      "A fully connected layer with n inputs and m outputs contains nm weights and m biases.",
      "One perceptron can solve linearly separable tasks such as AND but cannot solve XOR.",
      "Sigmoid is useful for a binary output; softmax is the standard output for mutually exclusive multiclass probabilities.",
      "Cross-entropy becomes small when the correct class receives high probability and large when it receives low probability.",
      "Validation performance selects hyperparameters and checkpoints. The test set should remain untouched until final evaluation.",
      "Confusion matrices and representative errors explain failure patterns that overall accuracy can hide.",
      "Flattened dense image models ignore spatial locality and grow rapidly with image size, motivating convolutional networks."
    ],
    notebooks: [
      ["Neural networks laboratory", "Calculate activations, solve AND and XOR, train a ten-class digit classifier, and inspect its mistakes.", "LN7_Neural_Networks.ipynb"],
      ["Lab 3 — NN versus CNN on 50 images per class", "Assignment: train a flattened fully connected NN and a CNN on the same 10 ImageNet classes with 50 images per class (500 total), then compare parameters, accuracy, learning curves, errors, and feature maps.", "Lab3_NN_vs_CNN_ImageNet_50.ipynb"]
    ],
    materialsTitle: "Lab 3 NN and CNN image classification assignment",
    materials: [
      ["Lab 3 student worksheet", "Use this worksheet with the NN versus CNN Colab to record calculations, model results, error analysis, and a supported conclusion.", "resources/Lab3_NN_vs_CNN_Imagenette_Student.docx"]
    ],
    mcqs: [
      {q:"What does a neuron calculate before applying its activation function?",options:["Only the bias","A weighted sum plus bias","The confusion matrix","The test accuracy"],answer:1,why:"The pre-activation value is z = x dot w + b."},
      {q:"Why do multilayer networks need nonlinear hidden activations?",options:["To reduce every output to zero","To prevent stacked layers from collapsing into one affine transformation","To remove all biases","To avoid using training data"],answer:1,why:"A composition of affine layers remains affine unless a nonlinear function separates them."},
      {q:"Which activation is commonly used in hidden layers?",options:["ReLU","Argmax","Accuracy","Confusion matrix"],answer:0,why:"ReLU is computationally simple and usually supports effective gradient flow."},
      {q:"What property distinguishes softmax outputs?",options:["They can only be negative","They sum to one across classes","They contain no exponentials","They require a binary task"],answer:1,why:"Softmax normalizes class scores into a probability distribution."},
      {q:"When is cross-entropy loss large?",options:["The correct class has high probability","The correct class has low probability","Every weight is zero","The image is grayscale"],answer:1,why:"Cross-entropy is minus log of the correct-class probability, so low probability produces high loss."},
      {q:"Which set should guide checkpoint selection?",options:["Validation set","Final test set","Only mislabeled images","No data"],answer:0,why:"Validation data guides model selection while the test set remains reserved for final evaluation."},
      {q:"Why can one perceptron not solve XOR?",options:["XOR has too few samples","XOR is not linearly separable","XOR needs no activation","XOR contains ten classes"],answer:1,why:"No single straight decision boundary separates the XOR classes."},
      {q:"What does the optimizer do?",options:["Uses gradients to update trainable parameters","Creates ground-truth labels","Changes the test set","Converts RGB to grayscale"],answer:0,why:"An optimizer applies gradient information to change weights and biases so the loss decreases."},
      {q:"Which metric is most important when missing a positive case is very costly?",options:["Recall","Precision","Specificity only","Training loss only"],answer:0,why:"Recall measures the proportion of actual positives that are detected, so it directly penalizes false negatives."},
      {q:"Which metric is most important when false alarms are very costly?",options:["Precision","Recall","Epoch count","Pixel count"],answer:0,why:"Precision measures how many predicted positives are truly positive, so it is reduced by false positives."},
      {q:"Why calculate precision and recall separately for each class?",options:["To reveal classes hidden by an overall average","To remove the need for labels","To guarantee perfect accuracy","To make the model nonlinear"],answer:0,why:"Per-class metrics show whether the model performs poorly on a minority or difficult class even when overall accuracy looks good."},
      {q:"What does the F1 score combine?",options:["Precision and recall through their harmonic mean","Accuracy and loss through addition","Weights and biases","Training and test images"],answer:0,why:"F1=2PR/(P+R), balancing precision and recall when both types of error matter."},
      {q:"Which learning-curve pattern is a typical sign of overfitting?",options:["Training loss decreases while validation loss starts increasing","Both losses remain high and unchanged","Training and validation losses decrease together","Validation accuracy is always higher than training accuracy"],answer:0,why:"The model keeps fitting the training data while its performance on unseen validation data deteriorates."},
      {q:"Which learning-curve pattern is a typical sign of underfitting?",options:["Both training and validation performance remain poor","Training accuracy is near 100% and validation accuracy is low","Validation loss rises after training loss falls","The confusion matrix has a diagonal"],answer:0,why:"Underfitting means the model has not captured enough structure, so it performs poorly even on training data."},
      {q:"How should a practical stopping epoch usually be selected?",options:["Use the checkpoint with the best validation performance, often with early stopping","Always use the final epoch","Choose the epoch with the highest training accuracy only","Choose an epoch before training begins"],answer:0,why:"Validation performance estimates generalization and early stopping prevents continuing after validation performance degrades."},
      {q:"Why should the test set not be used repeatedly to choose epochs or hyperparameters?",options:["It causes information leakage and makes the final estimate optimistic","It contains no labels","It cannot contain images","It changes the optimizer"],answer:0,why:"Repeated test-set decisions indirectly tune the model to the test data, so it no longer provides an unbiased final estimate."},
      {q:"What is a common issue when using a fully connected network directly on large images?",options:["Too many parameters and loss of spatial locality","It cannot use biases","It always produces binary output","It has no activation functions"],answer:0,why:"Flattening large images creates many connections and discards explicit neighborhood structure; convolution addresses both issues."},
      {q:"Which situation is a strong reason to use data augmentation for a vision model?",options:["The training set is small and realistic viewpoint or lighting changes are expected","The labels are unavailable","The test set must be modified","The network has no output layer"],answer:0,why:"Augmentation creates plausible training variation and can improve robustness to expected changes in appearance."},
      {q:"What does a diagonal-dominant confusion matrix usually indicate?",options:["Many predictions match the true class","Every class has identical recall","There are no false positives","The model has no parameters"],answer:0,why:"Diagonal entries are correct predictions; off-diagonal entries are errors."},
      {q:"A medical screening system should minimize missed disease cases. Which metric should be prioritized?",options:["Recall","Precision","Parameter count","Training accuracy only"],answer:0,why:"High recall reduces false negatives, which is important when failing to detect a disease is dangerous."},
      {q:"A spam filter should avoid incorrectly sending legitimate emails to spam. Which metric should be prioritized for the spam class?",options:["Precision","Recall","Number of epochs","Mean pixel value"],answer:0,why:"High precision means most emails predicted as spam really are spam, reducing false positives."},
      {q:"An autonomous vehicle detects pedestrians and missing a pedestrian could cause a collision. Which metric is especially important?",options:["Recall","Precision only","Training loss only","The number of hidden neurons"],answer:0,why:"High recall helps detect as many actual pedestrians as possible, reducing dangerous false negatives."},
      {q:"A factory vision system rejects products for manual inspection, but inspections are expensive. Which metric should be emphasized?",options:["Precision","Recall only","Softmax sum","Bias magnitude"],answer:0,why:"High precision means rejected items are more likely to be truly defective, reducing wasted inspections from false alarms."}
    ],
    trueFalse: [
      {q:"A bias is a trainable parameter.",answer:true,why:"Each dense output neuron normally has its own learned bias."},
      {q:"Stacking linear layers without nonlinear activations creates a nonlinear model.",answer:false,why:"The stacked affine transformations can be combined into one affine transformation."},
      {q:"Softmax probabilities across all classes sum to one.",answer:true,why:"Softmax normalizes exponentiated class scores by their total."},
      {q:"A confident wrong prediction should receive a small cross-entropy loss.",answer:false,why:"Low probability on the correct class produces a large loss."},
      {q:"Training accuracy alone is sufficient to measure generalization.",answer:false,why:"Validation and test performance are needed to estimate behavior on unseen data."},
      {q:"A confusion matrix can identify which class pairs the model confuses.",answer:true,why:"Off-diagonal cells count specific true-class and predicted-class combinations."},
      {q:"High recall is important when missing a positive case is costly.",answer:true,why:"Recall decreases when false negatives increase."},
      {q:"Flattening an image preserves explicit two-dimensional neighborhood structure.",answer:false,why:"Flattening converts spatial coordinates into one long vector and does not explicitly preserve locality."},
      {q:"Precision is the fraction of predicted positives that are actually positive.",answer:true,why:"Precision=TP/(TP+FP), so it focuses on the reliability of positive predictions."},
      {q:"Recall is the fraction of actual positives that the model correctly detects.",answer:true,why:"Recall=TP/(TP+FN), so it focuses on missed positive cases."},
      {q:"F1 can be useful when both false positives and false negatives matter.",answer:true,why:"F1 balances precision and recall using their harmonic mean."},
      {q:"Overall accuracy always reveals poor performance on every class.",answer:false,why:"A dominant class can make accuracy look high while minority-class performance is poor; per-class metrics are needed."},
      {q:"A large gap between training and validation performance can indicate overfitting.",answer:true,why:"The model may be memorizing training examples instead of generalizing."},
      {q:"Underfitting usually means the model performs poorly on both training and validation data.",answer:true,why:"The model has insufficient capacity, training, or useful features to capture the task."},
      {q:"The final epoch is always the best checkpoint to deploy.",answer:false,why:"Validation performance may peak earlier; the best validation checkpoint or early stopping is usually preferred."},
      {q:"The test set should be used repeatedly while selecting the best epoch.",answer:false,why:"That leaks information from the test set into model selection and weakens the final evaluation."},
      {q:"Fully connected networks applied to flattened images explicitly preserve local pixel neighborhoods.",answer:false,why:"Flattening removes the explicit two-dimensional locality that convolutional layers exploit."},
      {q:"Data augmentation can help a vision model handle realistic changes in lighting, position, or scale.",answer:true,why:"Plausible transformations expose the model to variation that may occur at deployment."},
      {q:"A confusion matrix diagonal contains the incorrectly classified examples.",answer:false,why:"The diagonal contains correct predictions; errors appear off the diagonal."}
    ],
    problemTypes: [["neuron","Neuron activation"],["trace","Trace one neuron manually"],["parameters","Dense-layer parameter count"],["forwardpass","Logic-gate forward pass"],["boundary","Decision-boundary visualizer"],["weightupdate","Weight update and learning rate"],["biaseffect","Bias-effect interactive problem"],["confusion4","4×4 confusion matrix metrics"],["overfit","Overfitting diagnosis"],["softrank","Softmax ranking problem"],["softmax","Softmax and cross-entropy"],["metrics","Precision, recall, and F1"]]
  },
  8: {
    short: "MLP Training",
    title: "Multilayer Perceptron Training",
    summary: "Trace a small sigmoid MLP, solve XOR, and use backpropagation to update weights and biases.",
    image: "assets/ln8-mlp.png",
    objectives: ["Calculate a complete forward pass through a 2–2–1 MLP.","Use sigmoid activation and binary cross-entropy for a binary output.","Compute output and hidden-layer errors with the chain rule.","Apply gradient descent to update every weight and bias."],
    concepts: [["Forward propagation","A forward pass computes hidden pre-activations, hidden sigmoid outputs, the output pre-activation, and the final prediction."],["Sigmoid activation","The sigmoid maps a pre-activation to a value between zero and one: σ(z)=1/(1+e⁻ᶻ). Its derivative is σ′(z)=σ(z)(1−σ(z))."],["Binary cross-entropy","For a sigmoid output, L=−[y ln(ŷ)+(1−y)ln(1−ŷ)]. With sigmoid output and BCE, δᵒ=ŷ−y."],["Backpropagation","The chain rule propagates the output error backward through outgoing weights and activation derivatives to obtain parameter gradients."],["Gradient descent","Each parameter is updated using θ_new=θ_old−η∂L/∂θ."],["XOR","XOR is not linearly separable, so it requires hidden nonlinear units rather than one perceptron."]],
    handsOn: [["Forward pass","Calculate z₁,h₁,z₂,h₂,zᵒ,ŷ, the class, and loss using editable parameters."],["Backpropagate","Calculate δᵒ, hidden errors, all gradients, and updated weights and biases."],["Experiment","Change any weight or bias and observe how the prediction and gradients change."],["Connect","Relate the hand calculation to how an optimizer trains a vision model."]],
    recap: "MLP training combines a forward computation with a backward gradient computation. Sigmoid nonlinearities allow a small hidden network to represent XOR, while binary cross-entropy and gradient descent provide the learning signal.",
    takeaways: ["A 2–2–1 MLP has nine trainable parameters.","For sigmoid output with BCE, δᵒ=ŷ−y.","A hidden error includes the outgoing weight and sigmoid derivative.","A bias gradient equals the neuron error.","Weights connected to an input of zero have zero gradient for that example.","The learning rate changes the step size, not the gradient itself."],
    notebooks: [],
    interactiveXor: true,
    materialsTitle: "LN8 MLP question set",
    materials: [["Questions","MCQs, true/false questions, and editable-parameter forward-pass and backpropagation problems.","https://github.com/MoyoG/CSBP441/blob/main/docs/assessment/LN8_MLP_Training_Question_Set.md"],["Answer key","Worked numerical answers for the 2–2–1 sigmoid XOR exercises.","https://github.com/MoyoG/CSBP441/blob/main/docs/assessment/LN8_MLP_Training_Answer_Key.md"]],
    mcqs: [
      {q:"In a 2–2–1 MLP, how many trainable parameters are there?",options:["5","7","9","12"],answer:2,why:"There are six hidden-layer parameters, two output weights, and one output bias."},
      {q:"Which activation function is used for every neuron in this exercise?",options:["ReLU","Sigmoid","Tanh","Softmax"],answer:1,why:"This exercise uses sigmoid activations in the hidden and output layers."},
      {q:"The sigmoid function is:",options:["σ(z)=max(0,z)","σ(z)=1/(1+e⁻ᶻ)","σ(z)=z²","σ(z)=eᶻ"],answer:1,why:"The sigmoid maps any real-valued pre-activation to a value between zero and one."},
      {q:"For binary cross-entropy with a sigmoid output, what is the output error?",options:["δᵒ=ŷ+y","δᵒ=ŷ−y","δᵒ=y−ŷ","δᵒ=ŷ(1−ŷ)"],answer:1,why:"The sigmoid derivative and BCE derivative simplify to δᵒ=ŷ−y."},
      {q:"A bias gradient for a neuron is:",options:["Always zero","The neuron error","The input multiplied by the learning rate","The output probability"],answer:1,why:"Because the bias connects to a constant input of one, its gradient equals the neuron error."},
      {q:"Which expression computes a hidden-neuron error?",options:["δₕ=δᵒh(1−h)","δₕ=δᵒvh(1−h)","δₕ=ŷ−y","δₕ=wᵀx+b"],answer:1,why:"The hidden error includes the output error, outgoing weight, and sigmoid derivative."},
      {q:"The XOR target for input (1,1) is:",options:["0","1","0.5","Depends on the weights"],answer:0,why:"XOR is one only when exactly one input is one."},
      {q:"A sigmoid output is classified as class 1 when:",options:["ŷ<0","ŷ≥0.5","ŷ=0","zᵒ<0"],answer:1,why:"The usual binary threshold is 0.5."},
      {q:"The gradient-descent update is:",options:["θnew=θold+η∇L","θnew=θold−η∇L","θnew=ηθold","θnew=θold/η"],answer:1,why:"Gradient descent moves parameters opposite the loss gradient."},
      {q:"For a full-batch XOR update, gradients are:",options:["Taken from only the first row","Averaged over the four XOR examples","Added without division","Computed only for the output bias"],answer:1,why:"Full-batch training averages the gradients over all examples in the batch."},
      {q:"What is the derivative of the sigmoid when its output is h=0.5?",options:["0","0.25","0.5","1"],answer:1,why:"σ′(z)=h(1−h)=0.5×0.5=0.25."},
      {q:"For x=(0,1), w₂₁=0.20, and b₁=−0.10, what is the hidden pre-activation z₁?",options:["−0.30","−0.10","0.10","0.30"],answer:2,why:"z₁=0.20×0+0.20×1−0.10=0.10."},
      {q:"If the output pre-activation is zᵒ=0, what is the sigmoid prediction?",options:["0","0.25","0.5","1"],answer:2,why:"σ(0)=1/(1+1)=0.5."},
      {q:"For y=1 and ŷ=0.80, what is the output error for sigmoid plus binary cross-entropy?",options:["0.80","0.20","−0.20","−0.80"],answer:2,why:"δᵒ=ŷ−y=0.80−1=−0.20."},
      {q:"If an input value xᵢ=0, what is the gradient of its connected weight for that training example?",options:["Always 1","Always equal to the learning rate","Zero","Equal to the output probability"],answer:2,why:"∂L/∂wᵢ=δxᵢ, so the gradient is zero when xᵢ=0."},
      {q:"Which expression correctly updates the output bias?",options:["bᵒnew=bᵒ+ηδᵒ","bᵒnew=bᵒ−ηδᵒ","bᵒnew=ηbᵒ","bᵒnew=bᵒ/η"],answer:1,why:"Gradient descent subtracts the learning rate times the bias gradient."},
      {q:"If the gradient remains unchanged and the learning rate increases from 0.1 to 0.2, what happens to the update step?",options:["It becomes half as large","It becomes twice as large","It becomes zero","It changes direction automatically"],answer:1,why:"The update is proportional to the learning rate when the gradient is fixed."},
      {q:"Which terms are needed to calculate a hidden-neuron error?",options:["Only the target label","The output error, outgoing weight, and sigmoid derivative","Only the input value","Only the learning rate"],answer:1,why:"Backpropagation applies the chain rule through the outgoing weight and hidden activation."},
      {q:"Why are nonlinear hidden activations necessary for solving XOR?",options:["They reduce the number of parameters to zero","They allow the network to represent nonlinear decision boundaries","They make XOR linearly separable","They remove the need for biases"],answer:1,why:"Nonlinear hidden units allow the network to represent a nonlinear decision boundary."},
      {q:"What is approximately σ(−2)?",options:["0.119","0.269","0.500","0.881"],answer:0,why:"σ(−2)=1/(1+e²)≈0.119."}
    ],
    trueFalse: [
      {q:"A 2–2–1 MLP has two input neurons, two hidden neurons, and one output neuron.",answer:true,why:"The notation gives the number of units in the input, hidden, and output layers."},
      {q:"The hidden-layer activations are computed before the output activation.",answer:true,why:"The output layer uses the hidden activations as its inputs."},
      {q:"The sigmoid output is always interpreted as a class label rather than a probability.",answer:false,why:"The sigmoid output is interpreted as a probability and thresholded to obtain a class label."},
      {q:"The XOR function is linearly separable.",answer:false,why:"A single straight decision boundary cannot separate the XOR classes."},
      {q:"For binary cross-entropy with sigmoid, δᵒ=ŷ−y.",answer:true,why:"The sigmoid and BCE derivatives simplify to this expression."},
      {q:"A bias behaves like a weight connected to an input whose value is 1.",answer:true,why:"This explains why the bias gradient equals the neuron error."},
      {q:"The hidden error depends on the outgoing weight from that hidden neuron.",answer:true,why:"The chain rule propagates error through the hidden neuron's outgoing connection."},
      {q:"A negative output error for a positive target means the predicted probability is too low.",answer:true,why:"For y=1, δᵒ=ŷ−1 is negative when ŷ<1, indicating the prediction should increase."},
      {q:"The learning rate should be multiplied into the loss before backpropagation.",answer:false,why:"The learning rate scales the parameter update after the gradient is calculated."},
      {q:"Updating weights requires recomputing the forward pass to see the new predictions.",answer:true,why:"The updated parameters produce new pre-activations and predictions in the next forward pass."},
      {q:"The sigmoid derivative can be calculated from its output as σ′(z)=h(1−h).",answer:true,why:"This is the standard sigmoid derivative written using h=σ(z)."},
      {q:"For a target y=0, a positive output error δᵒ=ŷ−y means that the predicted probability is greater than zero.",answer:true,why:"When y=0, δᵒ=ŷ, which is positive whenever the prediction is positive."},
      {q:"If xᵢ=0, the gradient of the weight connected to xᵢ is zero for that training example.",answer:true,why:"The weight gradient contains the factor xᵢ."},
      {q:"A bias can affect a neuron's activation even when all input values are zero.",answer:true,why:"The bias remains in the pre-activation when the weighted input sum is zero."},
      {q:"For binary cross-entropy when y=1, the loss is L=−ln(ŷ).",answer:true,why:"The second BCE term vanishes when y=1."},
      {q:"If the learning rate is zero, the network parameters remain unchanged after the update.",answer:true,why:"The update step is multiplied by the learning rate."},
      {q:"A larger learning rate always guarantees faster and more stable convergence.",answer:false,why:"A learning rate that is too large can cause oscillation or divergence."},
      {q:"If the hidden-layer activation is linear, stacking multiple linear layers still produces an overall linear function.",answer:true,why:"A composition of affine functions is still affine."},
      {q:"If a hidden neuron has an outgoing weight of zero, its backpropagated error is zero.",answer:true,why:"The hidden error includes multiplication by the outgoing weight."},
      {q:"For sigmoid output with binary cross-entropy, the output error is δᵒ=(ŷ−y)ŷ(1−ŷ).",answer:false,why:"The sigmoid derivative cancels with the BCE derivative, leaving δᵒ=ŷ−y."}
    ],
    problemTypes: [["mlp-forward","Forward pass through a 2–2–1 MLP"],["mlp-backprop","Backpropagation and parameter update"],["mlp-parameters","Count MLP trainable parameters"],["mlp-xor","Represent XOR with a hidden layer"],["mlp-batch","Full-batch gradient-descent update"]]
  },
  9: {
    short: "CNNs",
    title: "Convolutional Neural Networks",
    summary: "Use local receptive fields and shared filters to preserve image structure while learning hierarchical visual features.",
    image: "assets/ln9-cnns.png",
    objectives: ["Explain why CNNs are suited to image data.","Calculate convolutional output dimensions and parameter counts.","Explain stride, padding, pooling, batch normalization, and receptive fields.","Interpret feature hierarchies and compare LeNet with AlexNet."],
    concepts: [["CNN motivation","CNNs preserve spatial neighborhoods and reuse the same filter across image locations."],["Convolution","A filter multiplies a local image region, sums across channels, and produces one activation."],["Output size","For input N, filter F, padding P, and stride S, output size is (N-F+2P)/S+1 when the division is exact."],["Pooling","Max or average pooling reduces spatial resolution independently in each activation map."],["Feature hierarchy","Early layers detect edges and colors, while deeper layers combine them into textures, parts, and objects."],["Architectures","LeNet established compact digit-recognition CNNs, while AlexNet demonstrated deep CNN performance at ImageNet scale."]],
    handsOn: [["Calculate","Work through output-size and parameter-count examples."],["Compare","Change stride and padding and observe the output volume."],["Pool","Apply max pooling by hand to a small activation map."],["Interpret","Relate filter depth to the visual hierarchy learned by the network."]],
    recap: "CNNs combine local connectivity, shared weights, nonlinear activations, pooling, and depth to learn useful image representations end to end.",
    takeaways: ["A convolution filter spans all input channels but remains local in space.","Stride and padding control spatial output size, not the number of filter parameters.","Pooling reduces spatial resolution independently per channel.","CNN filters often progress from edges to textures, parts, and object-level patterns.","AlexNet used convolution, pooling, normalization, and dense layers in a deep ImageNet model."],
    notebooks: [],
    materialsTitle: "LN9 CNN assessment",
    materials: [["Question bank","20 MCQs and 10 true/false questions in the standard LN page.","ln9.html"],["Problem-solving set","10 CNN calculation and reasoning problems.","assessment/LN9_CNNs_Problem_Solving.md"]],
    mcqs: (window.LN9_QUESTIONS ? window.LN9_QUESTIONS.mcqs : []).map(x=>({q:x[0],options:x[1],answer:x[2],why:x[3]})),
    trueFalse: (window.LN9_QUESTIONS ? window.LN9_QUESTIONS.trueFalse : []).map(x=>({q:x[0],answer:x[1],why:x[2]})),
    problemQuestions: window.LN9_QUESTIONS ? window.LN9_QUESTIONS.problems : [],
    cnnArchitectureBuilder: true,
    cnnFeatureExplorer: true,
    problemTypes: [["p01","CNN review problem"]]
  },
  10: {
    short: "Corners",
    title: "Corner Detection",
    summary: "Use image gradients, the second-moment matrix, eigenvalue reasoning, and the Harris response to distinguish flat regions, edges, and corners.",
    image: "assets/ln10-corners.png",
    objectives: [
      "Explain how image gradients describe intensity change in a local region.",
      "Use the second-moment matrix to classify flat, edge-like, and corner-like regions.",
      "Interpret eigenvalues, eigenvectors, trace, determinant, and the Harris response.",
      "Explain rotational invariance and non-maximal suppression in corner detection."
    ],
    concepts: [
      ["Image gradients", "The pair (I_x,I_y) records local intensity change. A flat region has small gradients, an edge has strong change in one direction, and a corner has strong change in two directions."],
      ["Gradient distribution", "A window of gradient vectors summarizes the local region. Fitting an ellipse to this distribution reveals the dominant directions and the amount of variation."],
      ["Second-moment matrix", "M aggregates products of local gradients over a window. Its eigenvalues measure variation along the principal directions of the region."],
      ["Eigenvalue interpretation", "Two small eigenvalues indicate a flat region, one large and one small eigenvalue indicate an edge, and two large eigenvalues indicate a corner."],
      ["Harris response", "R = det(M) - k(trace(M))² uses determinant and trace as a fast, rotation-invariant substitute for explicitly computing eigenvalues."],
      ["Non-maximal suppression", "A sliding window retains a response only when its center is the local maximum. This reduces clusters of nearby detections to strong corner candidates."]
    ],
    handsOn: [
      ["Classify", "Given pairs of eigenvalues, label each region as flat, edge-like, or corner-like."],
      ["Calculate", "Compute trace, determinant, and Harris response for a small second-moment matrix."],
      ["Interpret", "Relate an ellipse's axes and orientation to the gradient distribution."],
      ["Suppress", "Apply a windowed maximum test to a corner-response map."]
    ],
    recap: "Corner detection identifies locations with strong intensity variation in two directions. The second-moment matrix captures that variation, while the Harris response and non-maximal suppression produce practical corner candidates.",
    takeaways: [
      "Flat regions have two small eigenvalues, edge-like regions have one large eigenvalue, and corner-like regions have two large eigenvalues.",
      "The eigenvectors give the principal directions of the local gradient distribution.",
      "The determinant is the product of the eigenvalues and the trace is their sum.",
      "Harris uses det(M) - k(trace(M))² and remains unchanged when the coordinate system rotates.",
      "Non-maximal suppression retains local response maxima and suppresses neighboring weaker responses."
    ],
    notebooks: [],
    problemIntro: "Attempt each corner-detection problem, then reveal the complete worked solution when you are ready.",
    problemDomain: "corners",
    problemQuestions: [
      ["Eigenvalue classification", "", ""],
      ["Harris response from M", "", ""],
      ["Build M from gradient samples", "", ""],
      ["Non-maximal suppression", "", ""],
      ["Rotational invariance check", "", ""]
    ],
    mcqs: [
      {q:"What is a corner in an image?",options:["A region with no intensity change","A point where strong intensity changes occur in two directions","A region with change in only one direction","A point with maximum brightness"],answer:1,why:"A corner has significant local variation along two different directions."},
      {q:"What does the image gradient (I_x,I_y) describe?",options:["Color names","Local intensity change and its direction","The camera focal length","The number of image channels"],answer:1,why:"The gradient components measure intensity change along the horizontal and vertical image axes."},
      {q:"Which region usually produces two small eigenvalues of the second-moment matrix?",options:["Flat region","Edge region","Corner region","A saturated region only"],answer:0,why:"A flat region has little gradient variation in either principal direction."},
      {q:"Which eigenvalue pattern is most characteristic of an edge?",options:["Both small","One large and one small","Both large and equal to zero","One negative and one positive"],answer:1,why:"An edge changes strongly in one direction but weakly along the edge."},
      {q:"Which eigenvalue pattern is most characteristic of a corner?",options:["Both small","One large and one small","Both large","Both negative"],answer:2,why:"A corner has strong intensity variation in two principal directions."},
      {q:"What does an eigenvector of the second-moment matrix represent?",options:["A principal direction of local variation","The image bit depth","The window size","The Harris constant k"],answer:0,why:"Eigenvectors identify the directions associated with the matrix's eigenvalues."},
      {q:"For a 2×2 matrix, the determinant equals:",options:["The sum of the eigenvalues","The product of the eigenvalues","The largest eigenvalue only","The window area"],answer:1,why:"The determinant is the product of the eigenvalues."},
      {q:"For a 2×2 matrix, the trace equals:",options:["The product of the eigenvalues","The sum of the eigenvalues","The square of the determinant","The gradient magnitude"],answer:1,why:"The trace equals the sum of the diagonal entries and also the sum of the eigenvalues."},
      {q:"The Harris corner response is commonly written as:",options:["R=det(M)-k(trace(M))²","R=trace(M)-det(M)²","R=I_x+I_y","R=det(M)+trace(M)"],answer:0,why:"Harris combines determinant and squared trace to favor two-dimensional variation."},
      {q:"Why does Harris use determinant and trace instead of explicitly computing eigenvalues?",options:["They are rotationally invariant and cheaper to compute","They remove all image noise","They always equal the gradient components","They make every region a corner"],answer:0,why:"Both quantities remain unchanged under a rotation of coordinates and avoid a full eigendecomposition."},
      {q:"A large positive Harris response generally indicates:",options:["A flat region","A strong corner candidate","A region with no pixels","A guaranteed edge endpoint"],answer:1,why:"A positive response occurs when both principal variations are sufficiently large."},
      {q:"What does non-maximal suppression do?",options:["Retains every response","Retains a response only if it is the local maximum in a window","Sets all responses to zero","Computes eigenvectors"],answer:1,why:"The center survives only when no neighbor in the window has a larger response."},
      {q:"Why is the gradient distribution represented with an ellipse?",options:["The ellipse summarizes spread and principal directions","It converts pixels to RGB","It removes the need for a window","It guarantees a circular corner"],answer:0,why:"The ellipse captures the distribution's orientation and spread along its principal axes."},
      {q:"If both eigenvalues are near zero, the local region is best described as:",options:["Flat","A corner","A strong diagonal edge","A maximum response"],answer:0,why:"Near-zero variation in both directions indicates a flat region."},
      {q:"If one eigenvalue is large and the other is near zero, the local region is best described as:",options:["Flat","Edge-like","Corner-like","Uniformly varying in two directions"],answer:1,why:"The region varies strongly in one direction and weakly in the other."},
      {q:"If the center of a response window is not the largest value, non-maximal suppression will:",options:["Retain it","Suppress it","Double it","Recompute the image gradient"],answer:1,why:"Only local maxima are retained."},
      {q:"What does rotating the image coordinate system do to the eigenvalues of M?",options:["It changes them arbitrarily","It leaves them unchanged","It sets them to zero","It swaps them with image intensities"],answer:1,why:"Eigenvalues describe intrinsic variation and are invariant under a coordinate rotation."},
      {q:"The constant k in the Harris response controls:",options:["The balance between determinant and trace terms","The image width","The number of eigenvectors","The non-maximal window's pixel values"],answer:0,why:"k weights the squared-trace penalty relative to the determinant."},
      {q:"Which operation is performed before classifying a region with the second-moment matrix?",options:["Aggregate local gradient products over a window","Convert every pixel to a label","Sort all image rows","Apply non-maximal suppression to raw pixels"],answer:0,why:"The matrix summarizes gradient products over a local neighborhood."},
      {q:"What is the main purpose of non-maximal suppression in corner detection?",options:["Produce a single strong candidate near each response peak","Increase the number of image channels","Estimate focal length","Compute the determinant"],answer:0,why:"Suppression removes nearby weaker responses and makes detections more localized."}
    ],
    trueFalse: [
      {q:"A flat region has little intensity variation in both image directions.",answer:true,why:"Both gradient directions are weak in a flat region."},
      {q:"An edge-like region usually has strong variation in one principal direction and weak variation in the other.",answer:true,why:"This produces one large and one small eigenvalue."},
      {q:"A corner-like region has two small eigenvalues.",answer:false,why:"A corner-like region has two large eigenvalues."},
      {q:"The second-moment matrix is built from local image-gradient products.",answer:true,why:"It aggregates terms such as I_x², I_xI_y, and I_y² over a window."},
      {q:"The determinant of M equals the sum of its eigenvalues.",answer:false,why:"The determinant is their product; the trace is their sum."},
      {q:"The trace and determinant of a matrix remain unchanged under a rotation of coordinates.",answer:true,why:"They are rotationally invariant quantities."},
      {q:"Harris response uses only the largest eigenvalue.",answer:false,why:"It combines determinant and squared trace, which depend on both eigenvalues."},
      {q:"A large positive Harris response is associated with a corner candidate.",answer:true,why:"The response becomes positive when both directions have strong variation."},
      {q:"Non-maximal suppression retains every pixel above a fixed threshold, even if a neighbor is larger.",answer:false,why:"It suppresses a response when a larger value exists in the local window."},
      {q:"The eigenvectors of the second-moment matrix indicate principal directions of local variation.",answer:true,why:"They define the axes of the fitted gradient-distribution ellipse."}
    ],
    problemTypes: []
  },
  11: {
    short: "Object Recognition and SIFT",
    title: "Object Recognition and SIFT",
    summary: "Compare template matching with local feature matching, then use scale-space blobs, orientations, and descriptors for recognition.",
    image: "assets/ln11-sift.png",
    objectives: [
      "Distinguish classification, detection, segmentation, recognition, and identification.",
      "Explain why SSD and normalized cross-correlation respond differently to image variation.",
      "Describe interest points, blobs, scale-space, the normalized Laplacian of Gaussian, and the Difference of Gaussians.",
      "Assign a principal orientation and explain how a SIFT descriptor represents local image structure.",
      "Calculate simplified SIFT matching quantities and discuss applications and limitations."
    ],
    concepts: [
      ["Recognition tasks", "Classification gives an image-level category, detection adds object locations, segmentation labels pixels, and recognition is the broader goal of relating visual evidence to objects."],
      ["Template matching", "Template matching scans an image and compares each local patch with a template using SSD or normalized cross-correlation."],
      ["Interest points", "Useful interest points have rich local content, a well-defined position, and a representation that can be compared across images."],
      ["Blob detection", "Blobs have a stable location and characteristic size. Scale-space responses identify local extrema across both image position and smoothing scale."],
      ["SIFT detection", "SIFT uses scale-space extrema and a Difference-of-Gaussians approximation to find keypoints efficiently."],
      ["Orientation and descriptor", "A gradient-direction histogram gives a principal orientation. Local orientation histograms then form a descriptor that supports matching under rotation, scale, and moderate lighting changes."]
    ],
    handsOn: [
      ["Compare", "Calculate SSD and normalized correlation for small template candidates."],
      ["Detect", "Inspect a 3×3×3 scale-space neighborhood and test for a blob maximum."],
      ["Orient", "Build a simplified gradient-direction histogram and select the principal orientation."],
      ["Match", "Compute descriptor distances and apply a nearest-neighbor ratio test."]
    ],
    recap: "SIFT replaces fragile whole-template comparison with distinctive local features. It detects blobs across scale, assigns a principal orientation, builds a local gradient descriptor, and matches descriptors across images.",
    takeaways: [
      "Template matching is sensitive to scale, rotation, lighting, and occlusion.",
      "SSD selects the smallest difference, while normalized correlation selects the largest similarity.",
      "Scale-space extrema identify blob-like keypoints at characteristic scales.",
      "The Difference of Gaussians provides a faster approximation to the normalized Laplacian of Gaussian.",
      "SIFT uses a principal orientation and local gradient-direction histograms to support robust matching."
    ],
    notebooks: [],
    problemDomain: "sift",
    siftTemplateExplorer: true,
    siftFeatureExplorer: true,
    mcqs: [
      {q:"Which task assigns one category to the whole image without locating individual objects?",options:["Image classification","Object detection","Semantic segmentation","Identification"],answer:0,why:"Classification produces an image-level class label."},
      {q:"For SSD template matching, which candidate is selected?",options:["The candidate with the largest SSD","The candidate with the smallest SSD","The candidate with the highest average brightness","The candidate nearest the image border"],answer:1,why:"SSD measures squared difference, so a smaller value means a closer match."},
      {q:"Normalized cross-correlation mainly reduces sensitivity to:",options:["Overall energy or brightness scaling","The number of image rows","The descriptor length","The camera frame rate"],answer:0,why:"The normalization divides by the template and patch energies."},
      {q:"Why are rich textured regions useful as interest points?",options:["They contain distinctive local information","They always have zero gradient","They are identical in every image","They do not need a position"],answer:0,why:"Distinctive local structure makes a point easier to locate and match."},
      {q:"Why is a blob a useful interest point?",options:["It has no characteristic size","It has a well-defined location and size","It contains no intensity variation","It is always a straight edge"],answer:1,why:"A blob has localized structure with a stable position and characteristic scale."},
      {q:"How are blobs detected in scale-space?",options:["By selecting every bright pixel","By finding local extrema across position and scale","By sorting image rows","By measuring only image width"],answer:1,why:"A scale-space extremum is larger than neighboring spatial pixels and neighboring scales."},
      {q:"The Difference of Gaussians is used in SIFT as:",options:["A color-conversion rule","A fast approximation to the normalized Laplacian of Gaussian","A loss function for classification","A camera calibration matrix"],answer:1,why:"DoG approximates the scale-normalized LoG response efficiently."},
      {q:"How does SIFT choose a principal orientation?",options:["From a histogram of local gradient directions","From the image file name","From the largest RGB channel only","From the camera focal length"],answer:0,why:"The dominant bin in the local gradient-direction histogram gives the orientation."},
      {q:"A SIFT descriptor is built mainly from:",options:["Global image color averages","Local gradient-direction histograms","Bounding-box coordinates only","Raw pixel locations without gradients"],answer:1,why:"SIFT summarizes local gradient directions over spatial regions."},
      {q:"Which is a practical application of SIFT matching?",options:["Changing an image from RGB to grayscale only","Panorama stitching","Counting image bits","Increasing aperture size"],answer:1,why:"Matched local features can align overlapping images for panorama construction."}
    ],
    trueFalse: [
      {q:"Template matching is naturally invariant to arbitrary rotation and scale changes.",answer:false,why:"A rotated or resized object may no longer align with the fixed template."},
      {q:"SSD template matching prefers the candidate with the lowest score.",answer:true,why:"The score is a sum of squared differences."},
      {q:"Normalized cross-correlation can reduce the effect of overall energy differences.",answer:true,why:"The normalization divides by the energies of the patch and template."},
      {q:"A flat patch is usually a strong interest point because it has many distinctive gradients.",answer:false,why:"Flat patches provide little local information and are ambiguous to match."},
      {q:"A blob can have a characteristic scale that helps identify its size.",answer:true,why:"Its normalized scale-space response peaks at a characteristic smoothing scale."},
      {q:"SIFT searches only within one image scale.",answer:false,why:"SIFT searches extrema across both image location and scale."},
      {q:"The Difference of Gaussians is used as a faster approximation to the normalized LoG.",answer:true,why:"Subtracting nearby Gaussian scales approximates a scale-space derivative."},
      {q:"The principal orientation helps SIFT compensate for image rotation.",answer:true,why:"The local descriptor can be aligned relative to the dominant orientation."},
      {q:"A SIFT descriptor describes the entire image with one global average color.",answer:false,why:"It describes local gradient structure around a keypoint."},
      {q:"Descriptor distances can be used to rank possible feature matches.",answer:true,why:"The nearest descriptor is the candidate with the smallest distance."}
    ],
    problemTypes: [["sift-template","Template matching with SSD"],["sift-ncc","Normalized cross-correlation"],["sift-scale","Scale-space blob detection"],["sift-orientation","Principal orientation histogram"],["sift-descriptor","SIFT descriptor matching"]]
  },
  12: {
    short: "YOLO",
    title: "YOLO Object Detection",
    summary: "Understand how YOLO predicts bounding boxes, objectness, and class probabilities in one forward pass, then filter and suppress overlapping detections.",
    image: "assets/ln12-yolo.png",
    objectives: [
      "Distinguish object detection from image classification.",
      "Explain YOLOv1's S×S grid, B boxes per cell, and output size S×S×(5B+C).",
      "Calculate confidence scores from objectness and intersection-over-union.",
      "Apply confidence filtering, standard NMS, and class-aware NMS.",
      "Identify which YOLO loss terms apply when an object is present or absent."
    ],
    concepts: [
      ["Detection versus classification", "Classification assigns labels to an image. Object detection also locates each object with a bounding box."],
      ["Two-stage detectors", "Earlier region-based systems generated candidate regions, classified them separately, and refined their boxes. R-CNN used about 2,000 proposals from Selective Search."],
      ["One-pass prediction", "YOLO processes the whole image with one neural network forward pass. One pass can still predict many boxes."],
      ["Grid and boxes", "YOLOv1 divides the image into an S×S grid. Each cell predicts B boxes, five values per box, and shared class probabilities for the cell."],
      ["Confidence and IoU", "A box confidence combines the model's objectness estimate with its overlap with the ground-truth box: confidence = Pr(Object)×IoU."],
      ["Filtering and NMS", "Confidence filtering removes weak boxes. Non-maximum suppression keeps a high-scoring box and suppresses overlapping boxes according to an IoU threshold."],
      ["YOLOv1 trade-offs", "Large receptive fields and center-based cell responsibility help detect large objects. The model can struggle with multiple small objects close together and trades some localization accuracy for speed."]
    ],
    handsOn: [
      ["Count", "Calculate grid cells, predicted boxes, values per cell, and the complete YOLOv1 output size."],
      ["Score", "Compute object confidence from objectness and IoU, then apply a confidence threshold."],
      ["Suppress", "Compare box scores and IoU values under several NMS thresholds."],
      ["Trace", "Assign an object to the grid cell containing its center and identify the active loss terms."]
    ],
    recap: "YOLO turns object detection into one unified prediction problem. A grid predicts boxes and class probabilities, while confidence filtering and NMS turn raw predictions into a practical set of detections.",
    takeaways: [
      "Object detection predicts both what an object is and where it is.",
      "YOLOv1 output size is S×S×(B×5+C), with five values for each predicted box.",
      "One forward pass can produce many candidate boxes across the grid.",
      "Confidence filtering uses a score threshold, while NMS uses IoU to remove duplicate boxes.",
      "Lower NMS thresholds suppress more aggressively, and class-aware NMS compares boxes within the same class.",
      "YOLOv1 is fast but can lose localization accuracy and struggle with nearby small objects."
    ],
    notebooks: [],
    problemIntro: "Attempt each YOLO problem, then reveal the complete worked solution when you are ready.",
    problemDomain: "yolo",
    yoloDetectorLab: true,
    problemQuestions: [
      ["YOLOv1 output dimensions", "", ""],
      ["Confidence score and filtering", "", ""],
      ["NMS threshold decisions", "", ""],
      ["Responsible grid cell", "", ""],
      ["YOLO loss terms", "", ""],
      ["Class-specific scores for four YOLO boxes", "", ""],
      ["Class-specific NMS with five boxes", "", ""]
    ],
    mcqs: [
      {q:"What additional output does object detection provide beyond image classification?",options:["Only a brighter image","The location of each detected object","Only the image width","A camera calibration matrix"],answer:1,why:"Detection predicts both object categories and their locations, commonly with bounding boxes."},
      {q:"What did a typical two-stage detector do before classification?",options:["Generate candidate regions","Remove all image colors","Predict only one class for the whole image","Skip localization"],answer:0,why:"Two-stage detectors first generated candidate regions and then classified and refined them."},
      {q:"How many candidate regions did the lecture associate with the original R-CNN pipeline?",options:["About 2","About 20","About 200","About 2,000"],answer:3,why:"R-CNN used a region-proposal method that generated approximately 2,000 candidate regions per image."},
      {q:"What is the central idea of YOLO?",options:["Run a classifier separately on every crop","Use one neural network to process the whole image at once","Detect only image edges","Replace boxes with a single class label"],answer:1,why:"YOLO predicts boxes, objectness, and class probabilities from the whole image in one forward pass."},
      {q:"For S=7, how many grid cells does YOLOv1 create?",options:["7","14","49","70"],answer:2,why:"A 7×7 grid contains 49 cells."},
      {q:"If each grid cell predicts B=2 boxes, how many boxes does a 7×7 grid predict before filtering?",options:["14","49","98","1470"],answer:2,why:"There are 49 cells and 2 boxes per cell, so 49×2=98 candidate boxes."},
      {q:"Which five values belong to each YOLOv1 box prediction?",options:["x, y, width, height, confidence","red, green, blue, hue, saturation","class, IoU, NMS, mAP, loss","row, column, stride, padding, channel"],answer:0,why:"Each box predicts center position, width, height, and confidence."},
      {q:"What does C represent in the YOLOv1 output formula S×S×(B×5+C)?",options:["The number of image channels","The number of classes","The number of candidate regions","The confidence threshold"],answer:1,why:"C is the number of object classes and the class probabilities are shared by the grid cell."},
      {q:"For S=7, B=2, and C=20, what is the YOLOv1 output size?",options:["7×7×20","7×7×25","7×7×30=1470","7×7×40=1960"],answer:2,why:"Each cell predicts 2×5+20=30 values, so 7×7×30=1470."},
      {q:"How is the confidence score illustrated in the lecture calculated?",options:["Pr(Object)+IoU","Pr(Object)×IoU","Pr(Object)−IoU","IoU divided by the number of classes"],answer:1,why:"The lecture multiplies the object's probability by the overlap with the ground-truth box."},
      {q:"If Pr(Object)=0.8 and IoU=0.58, what is the approximate confidence score?",options:["0.046","0.46","1.38","8.58"],answer:1,why:"0.8×0.58=0.464, which rounds to 0.46."},
      {q:"What does confidence filtering do?",options:["Remove boxes whose score is below a chosen threshold","Increase the grid size","Assign a new class to every box","Compute the convolutional features again"],answer:0,why:"Filtering removes weak candidate detections before later processing."},
      {q:"What does standard NMS use to compare overlapping boxes?",options:["IoU and box scores","Only image brightness","Only the number of classes","The focal length"],answer:0,why:"NMS keeps the higher-scoring box and uses IoU to decide whether another box overlaps too much."},
      {q:"Box A has the higher score, IoU(A,B)=0.40, and the NMS threshold is 0.30. What happens to B?",options:["B is kept because 0.40 is positive","B is suppressed because 0.40>0.30","A is suppressed because it is first","Both boxes are always removed"],answer:1,why:"When the IoU exceeds the threshold, NMS suppresses the lower-scoring box B."},
      {q:"With IoU(A,B)=0.40 and NMS threshold 0.50, what happens to B?",options:["B is suppressed because 0.40<0.50","B is kept because 0.40<0.50","A is removed","The grid cell is deleted"],answer:1,why:"The overlap does not exceed the threshold, so B remains under this rule."},
      {q:"What is the effect of lowering the NMS threshold?",options:["Less aggressive suppression and more overlapping boxes","More aggressive suppression and fewer boxes","No change in suppression","More classes per grid cell"],answer:1,why:"A lower threshold is exceeded more easily, so more overlapping boxes are suppressed."},
      {q:"How does class-aware NMS compare boxes?",options:["It compares every class with every other class","It compares boxes within the same class","It ignores confidence scores","It keeps only the largest object"],answer:1,why:"Different classes do not suppress each other in class-aware NMS."},
      {q:"Which grid cell is responsible for an object in YOLOv1?",options:["Every cell touched by the object's box","The cell containing the object's center","Only the top-left cell","The cell with the highest image brightness"],answer:1,why:"YOLOv1 assigns responsibility according to the cell containing the object center."},
      {q:"Why can YOLOv1 handle a large object without a separate large-object detector?",options:["It uses large receptive fields and predicts the box size","It removes the grid for large objects","It always uses one pixel per object","It classifies only the object's center pixel"],answer:0,why:"Large receptive fields provide context, while the responsible cell predicts the object's width and height."},
      {q:"When does YOLO coordinate loss apply according to the lecture?",options:["Only when an object exists and the box is responsible","Only when the image is empty","For every grid cell regardless of content","Only after NMS"],answer:0,why:"Coordinate loss applies to the responsible prediction when an object exists in that cell."}
    ],
    trueFalse: [
      {q:"Object detection predicts both object categories and object locations.",answer:true,why:"Detection combines classification with localization."},
      {q:"R-CNN used a region-proposal method that produced approximately 2,000 candidate regions per image.",answer:true,why:"The lecture describes Selective Search proposals at that scale."},
      {q:"YOLO runs a separate classifier on every candidate crop during its normal one-pass prediction.",answer:false,why:"YOLO processes the whole image with one network forward pass."},
      {q:"One YOLO forward pass means that YOLO can produce only one bounding box.",answer:false,why:"The single pass can predict many boxes across the grid."},
      {q:"For YOLOv1, each predicted box contributes five values to the output tensor.",answer:true,why:"The five values are center position, width, height, and confidence."},
      {q:"The illustrated confidence score multiplies objectness by IoU.",answer:true,why:"The lecture uses Pr(Object)×IoU for the confidence calculation."},
      {q:"NMS keeps the lower-scoring box when its IoU with a higher-scoring box exceeds the threshold.",answer:false,why:"NMS suppresses the lower-scoring box when the overlap is too high."},
      {q:"A lower NMS threshold generally produces more aggressive suppression.",answer:true,why:"The IoU exceeds a lower threshold more easily."},
      {q:"Class-aware NMS allows boxes from different classes to suppress one another.",answer:false,why:"Class-aware NMS compares boxes only within the same class."},
      {q:"YOLOv1 assigns an object to the grid cell containing its center.",answer:true,why:"The center determines the responsible cell even when the object spans multiple cells."}
    ],
    problemTypes: []
  },
  13: {
    short: "U-Net",
    title: "U-Net Image Segmentation",
    summary: "Understand how an encoder–decoder network combines deep context with high-resolution skip features to produce a class decision for every pixel.",
    image: "assets/ln13-unet.png",
    objectives: [
      "Distinguish semantic segmentation from image classification and object detection.",
      "Trace spatial dimensions and channel counts through a U-Net encoder and decoder.",
      "Explain how max pooling, up-convolution, cropping, and concatenation change feature maps.",
      "Calculate multi-channel convolution after a skip connection and a final 1×1 convolution.",
      "Convert per-pixel logits to probabilities and evaluate a weighted segmentation loss."
    ],
    concepts: [
      ["Pixel-level prediction", "Segmentation assigns a class to each pixel. The output is a dense mask rather than one label for the entire image or one box per object."],
      ["U-shaped encoder–decoder", "The encoder contracts the spatial grid while learning increasingly contextual features. The decoder expands the grid and reconstructs a dense output."],
      ["Pooling and context", "2×2 max pooling with stride 2 reduces height and width, increases the effective receptive field, and retains the strongest local response in each window."],
      ["Up-convolution", "A transposed convolution learns how to project a low-resolution feature map onto a larger grid. Its output is not simply a copied image; the kernel weights are learned."],
      ["Skip connections", "An encoder map is concatenated with a decoder map at the same spatial size. A following multi-channel convolution learns how to fuse semantic context with fine boundary detail."],
      ["The 1×1 output convolution", "A 1×1 filter mixes channels at one pixel without mixing neighboring pixels. With K classes it produces K logits at every spatial location."],
      ["Softmax and weighted loss", "Softmax converts the K logits at each pixel into class probabilities. A spatial weight map can make thin borders or other important pixels contribute more to the loss."]
    ],
    handsOn: [
      ["Contract", "Track two valid 3×3 convolutions and a 2×2 max pool through an encoder block."],
      ["Expand", "Place scaled kernel blocks to calculate a 2×2 transposed-convolution example."],
      ["Fuse", "Concatenate decoder and encoder channels, then calculate one multi-channel convolution output."],
      ["Classify pixels", "Apply a 1×1 convolution, softmax, and weighted cross-entropy at individual pixels."],
      ["Explore", "Use the browser explorer to see the same data-flow stages on course images or a local upload."]
    ],
    recap: "U-Net keeps a contracting path for context and an expanding path for precise localization. Skip connections restore encoder detail, and the final 1×1 convolution turns the fused features into per-pixel class scores.",
    takeaways: [
      "Semantic segmentation predicts a class for every pixel.",
      "The encoder trades spatial resolution for contextual and semantic information.",
      "A transposed convolution can learn an upsampling operation; overlapping contributions are added.",
      "Skip connections concatenate encoder detail with decoder context, then a convolution learns their fusion.",
      "A 1×1 convolution changes the channel meaning at each pixel while preserving the spatial grid.",
      "Softmax and a weighted pixel loss convert logits into trainable segmentation decisions."
    ],
    notebooks: [],
    problemIntro: "Attempt each U-Net calculation, then reveal the complete worked solution when you are ready.",
    problemDomain: "unet",
    unetExplorer: true,
    problemQuestions: [
      ["Up-convolution output", "", ""],
      ["Skip connection: concatenate and fuse", "", ""],
      ["Final 1×1 convolution", "", ""],
      ["U-Net spatial-size bookkeeping", "", ""],
      ["Pixel softmax and weighted loss", "", ""]
    ],
    mcqs: [
      {q:"What is the main output of semantic segmentation?",options:["One label for the whole image","One bounding box per object","A class label for each pixel","Only the image dimensions"],answer:2,why:"Semantic segmentation produces a dense, pixel-level class assignment."},
      {q:"What happens to height and width after 2×2 max pooling with stride 2?",options:["They usually double","They are approximately halved","They stay unchanged","They become the number of classes"],answer:1,why:"With a 2×2 window and stride 2, one output is produced for each non-overlapping 2×2 input block."},
      {q:"Why does a U-Net encoder use deeper layers?",options:["To remove all channels","To capture larger-context and more semantic features","To prevent any downsampling","To replace the input image with a label"],answer:1,why:"Downsampling and depth increase context and allow the network to represent semantic structure."},
      {q:"In the block-placement view of a transposed convolution, what happens when projected kernel blocks overlap?",options:["The overlap is ignored","The overlapping contributions are added","Only the first block is kept","The input is cropped"],answer:1,why:"Transposed convolution accumulates the weighted contributions written to each output location."},
      {q:"What must be true before an encoder map and decoder map are concatenated?",options:["They must have the same spatial height and width","They must have the same number of channels","They must be identical images","They must have the same kernel weights"],answer:0,why:"Concatenation along the channel axis requires matching spatial dimensions; the channel counts may differ."},
      {q:"What does the convolution after a skip concatenation learn?",options:["How to fuse decoder context and encoder detail","How to delete the decoder map","How to change a pixel into a bounding box","How to sort class labels"],answer:0,why:"The multi-channel filters combine the two sources into refined decoder features."},
      {q:"What is special about a 1×1 convolution?",options:["It mixes only neighboring rows","It mixes channels at one pixel without spatial mixing","It always doubles the image size","It can only produce one class"],answer:1,why:"A 1×1 filter sees the channel vector at one spatial position and leaves neighboring positions separate."},
      {q:"If a feature map is H×W×32 and a 1×1 convolution has 4 output filters, what is the output shape?",options:["1×1×32","H×W×4","32×H×W×4","H/2×W/2×32"],answer:1,why:"The spatial dimensions remain H×W and the number of channels becomes the number of output filters, 4."},
      {q:"What does softmax produce at one pixel?",options:["A probability distribution over the segmentation classes","A bounding-box IoU","A pooling window","A new image coordinate"],answer:0,why:"Softmax normalizes the per-class logits so the probabilities sum to one at that pixel."},
      {q:"Why can a U-Net use a spatially weighted loss?",options:["To make selected pixels, such as borders, contribute more strongly","To remove all background pixels from the input","To guarantee zero loss","To change the camera resolution"],answer:0,why:"A weight map can emphasize boundaries or rare/important pixels during training."}
    ],
    trueFalse: [
      {q:"Semantic segmentation predicts one class label for every pixel.",answer:true,why:"That dense output is what distinguishes segmentation from a single image label."},
      {q:"The encoder path of U-Net usually increases spatial resolution at every stage.",answer:false,why:"The encoder usually downsamples to capture larger context; the decoder restores resolution."},
      {q:"Max pooling with stride 2 normally reduces height and width by about a factor of two.",answer:true,why:"A 2×2 stride-2 pool samples one output per 2×2 region."},
      {q:"A transposed convolution is always identical to nearest-neighbor interpolation.",answer:false,why:"It is a learned operation whose kernel can combine and distribute input activations."},
      {q:"Skip concatenation requires the encoder and decoder maps to agree spatially.",answer:true,why:"Height and width must match when concatenating along channels."},
      {q:"A 1×1 convolution can mix channels while preserving the spatial dimensions.",answer:true,why:"The filter spans the channel axis at one pixel but has no spatial extent beyond that pixel."},
      {q:"Softmax probabilities at one pixel should sum to approximately one.",answer:true,why:"The normalization denominator makes the class probabilities sum to one."},
      {q:"A weighted pixel loss gives every pixel exactly the same contribution.",answer:false,why:"The weight map is used precisely to vary how strongly different pixels contribute."}
    ],
    problemTypes: []
  }
};

// The course numbering places SIFT at LN10 and corner detection at LN11.
(() => {
  const ln10Content = window.COURSE_DATA[10];
  window.COURSE_DATA[10] = window.COURSE_DATA[11];
  window.COURSE_DATA[11] = ln10Content;
})();

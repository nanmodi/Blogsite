const express=require('express')
const app=express()
const path=require('path')
const User=require('./models/users.js')
const Post=require('./models/posts.js')
const Comment=require('./models/comments.js')
const createConnection = require('./db-connection/db.js');

const cookieparser=require('cookie-parser')

engine = require('ejs-mate')
const multer = require('multer');



const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/'); 
  },
  filename: (req, file, cb) => {
    
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

// Set up file filter to allow only images
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, JPG, and PNG images are allowed'), false);
  }
};

// Set up multer middleware
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 1024 * 1024 * 5 } // Limit file size to 5MB
});

app.use(express.urlencoded({ extended: true }));  // For parsing application/x-www-form-urlencoded
app.use(express.json());  // For parsing application/json (if needed)
app.use(cookieparser())

app.use(express.static(path.join(__dirname, 'public')));
app.engine('ejs', engine);

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
createConnection().then(() => {
  console.log('Connected to database');
}).catch((err) => {
  console.error('Error connecting to the database:', err);
});

app.get("/",async(req,res)=>{
  users=await User.find();
  console.log(users)
  res.render("index",{users})
})
app.get('/user/signup',(req,res)=>{
   res.render('signup')
})
app.post('/signup',async(req,res)=>{
  const {username,email,password}=req.body;
  const user=new User({username,email,password})
  
  suser=await user.save()
  res.cookie('userid', suser._id);

  res.redirect('/')
})
app.get('/post/create',(req,res)=>{
  res.render('createpost')
   
})


app.post('/post/create', upload.single('image'), async (req, res) => {
  try {
    const { title, content } = req.body;

    
    const userId = req.cookies.userid;

    if (!userId) {
      return res.status(401).send('User not authenticated');
    }

    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send('User not found');
    }

    
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

    // Create a new post associated with the user, including the image
    const newPost = new Post({
      title,
      content,
      image: imagePath, // Save the image path in the post
      author: user,
      created_at: new Date()
    });

    // Save the post to the database
    await newPost.save();

    // Optionally, update the user's posts list
    user.posts_list.push(newPost._id);
    await user.save();

    res.redirect('/'); // Redirect after successful post creation
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).send('Internal Server Error');
  }
});
app.get('/user/posts', async (req, res) => {
  try {
    
      const userId = req.cookies.userid;

      if (!userId) {
          return res.status(401).send('User not authenticated');
      }

      
      const user = await User.findById(userId).populate('posts_list');
      if (!user) {
          return res.status(404).send('User not found');
      }

      
      const userPosts = user.posts_list;

      
      res.render('user_posts', { posts: userPosts });
  } catch (error) {
      console.error('Error fetching user posts:', error);
      res.status(500).send('Internal Server Error');
  }
});

























app.listen(3000,()=>{
  console.log("App running on port 3000");
})
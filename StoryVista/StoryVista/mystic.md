Create image from text - Mystic
Convert descriptive text input into images using AI. This endpoint accepts a variety of parameters to customize the generated images.

POST
/
v1
/
ai
/
mystic

Try it
​
Important
Mystic image generation mode is Freepik’s exclusive advanced AI workflow for ultra-realistic, high-resolution images.

Make sure you get your webhook set up on every request in order to retrieve your generations.

Authorizations
​
x-freepik-api-key
stringheaderrequired
Your Freepik API key. Required for authentication. Learn how to obtain an API key

Body
application/json
​
prompt
string
AI Model Prompt Description
The prompt is a short text that describes the image you want to generate. It can range from simple descriptions, like "a cat", to detailed scenarios, such as "a cat with wings, playing the guitar, and wearing a hat". If no prompt is provided, the AI will generate a random image.

Adding Characters to the Prompt
You can introduce characters into the prompt using the following syntax:

@character_name: Represents the character you want to include. Example: My friend @john is a great artist.
Modifying Character Strength
To adjust the influence or "strength" of a character in the image, use the following syntax:

@character_name::strength: Specify the character’s strength by appending ::strength to their name, where strength is a numerical value. Example: My friend @john::200 is a great artist.
Higher strength values will make the character more prominent in the generated image.

​
webhook_url
string
Optional callback URL that will receive asynchronous notifications whenever the task changes status. The payload sent to this URL is the same as the corresponding GET endpoint response, but without the data field.

Example:
"https://www.example.com/webhook"

​
structure_reference
string
Structure Reference
Base64 image to use as structure reference. Using images as structure references allows you to influence the shape of your final image. This feature enables various creative applications such as coloring sketches, transforming cartoons into realistic images, texturing basic 3D models, or converting real images into cartoons. The outcome is entirely controlled by your prompt, offering limitless creative possibilities.

​
structure_strength
integerdefault:50
Note: This parameter only takes effect when a "structure_reference" image is provided.
Allows to maintain the structure of the original image.

Required range: 0 <= x <= 100
​
style_reference
string
Style Reference
Base64 image to use as style reference. Using images as style references allows you to influence the aesthetic of your creation. This is possibly the most powerful tool of Mystic, as it truly lets you create incredibly unique images.

​
adherence
integerdefault:50
Note: This parameter only takes effect when a "style_reference" image is provided.
Increasing this value will make your generation more faithful to the prompt, but it may transfer the style a bit less accurately. Higher values can help fix small artifacts, anatomical errors and text readability. Lower values will give you more creative images and closer to the style reference.

Required range: 0 <= x <= 100
​
hdr
integerdefault:50
Note: This parameter only takes effect when a "style_reference" image is provided.
Increasing this value can give you a more detailed image, at the cost of a more 'AI look' and slightly worse style transfer. Lower values have a more natural and artistic look but may increase artifacts.

Required range: 0 <= x <= 100
​
resolution
enum<string>default:2k
Resolution of the image

Available options: 1k, 2k, 4k 
​
aspect_ratio
enum<string>default:square_1_1
Image size with the aspect ratio. The aspect ratio is the proportional relationship between an image's width and height, expressed as *_width_height (e.g., square_1_1, widescreen_16_9). It is calculated by dividing the width by the height.

If not present, the default is square_1_1.
Note: For the fluid model, only this values are valid:

square_1_1
social_story_9_16
widescreen_16_9
traditional_3_4
classic_4_3
Available options: square_1_1, classic_4_3, traditional_3_4, widescreen_16_9, social_story_9_16, smartphone_horizontal_20_9, smartphone_vertical_9_20, standard_3_2, portrait_2_3, horizontal_2_1, vertical_1_2, social_5_4, social_post_4_5 
Example:
"square_1_1"

​
model
enum<string>default:realism
zen - for smoother, basic, and cleaner results. Fewer objects in the scene and less intricate details. The softer looking one.
fluid - the model that adheres best to prompts with great average quality for all kind of images. It can generate really creative images! It will always follow your input no matter what. However, since it is using Google's Imagen 3, it is a bit over-moderated, and some simple prompts containing words like "war" may be flagged and not generated (sorry about that! But there's nothing we can do!).
realism - with a more realistic color palette. It tries to give an extra boost of reality to your images, a kind of "less AI look". Works especially well with photographs but also magically works with illustrations too.
IMPORTANT: You should use Zen or Fluid if you are trying to generate something that is really fantastic or a known character, Realism may not follow your prompt well.

Available options: realism, fluid, zen 
​
creative_detailing
integerdefault:33
Higher values can achieve greater detail per pixel at higher resolutions at the cost of giving a somewhat more "HDR" or artificial look.
Very high values can generate quite crazy things like eyes where they shouldn't appear, etc.

Valid values range [0, 100], default 33

Required range: 0 <= x <= 100
​
engine
enum<string>default:automatic
Select the engine for the AI model. Available options:

automatic - default choice
Illusio - for smoother illustrations, landscapes, and nature. The softer looking one.
Sharpy - better for realistic images like photographs and for a more grainy look. It provides the sharpest and most detailed images. If you use it for illustrations it will give them more texture and a less softer look.
Sparkle - also good for realistic images. It's a middle ground between Illusio and Sharpy.
Available options: automatic, magnific_illusio, magnific_sharpy, magnific_sparkle 
​
fixed_generation
booleandefault:false
When this option is enabled, using the same settings will consistently produce the same image.
Fixed generations are ideal for fine-tuning, as it allows for incremental changes to parameters (such as the prompt) to see subtle variations in the output.
When disabled, expect each generation to introduce a degree of randomness, leading to more diverse outcomes.

​
filter_nsfw
booleandefault:true
When enabled, if the AI model return some nsfw image we will change it for a black image. This feature is experimental and may not be 100% accurate

​
styling
object
Styling options for the image


Show child attributes

Response
200

200
application/json
OK - The request has succeeded and the Mystic process has started.

​
data
objectrequired

Show child attributes

Example:
{
  "task_id": "046b6c7f-0b8a-43b9-b35d-6489e6daee91",
  "status": "IN_PROGRESS",
  "generated": [
    "https://openapi-generator.tech",
    "https://openapi-generator.tech"
  ]
} 
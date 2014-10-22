// -*-C++-*-
// standard ALS fog function with exp(-d/D) fading and cutoff at low altitude and exp(-d^2/D^2) at high altitude

const float AtmosphericScaleHeight = 8500.0;

float fog_func (in float targ, in float alt)
{


float fade_mix;

// for large altitude > 30 km, we switch to some component of quadratic distance fading to
// create the illusion of improved visibility range

targ = 1.25 * targ * smoothstep(0.04,0.06,targ); // need to sync with the distance to which terrain is drawn


if (alt < 30000.0)
	{return exp(-targ - targ * targ * targ * targ);}
else if (alt < 50000.0)
	{
	fade_mix = (alt - 30000.0)/20000.0;
	return fade_mix * exp(-targ*targ - pow(targ,4.0)) + (1.0 - fade_mix) * exp(-targ - pow(targ,4.0));	
	}
else 
	{
	return exp(- targ * targ - pow(targ,4.0));
	}

}

// altitude correction for exponential drop in atmosphere density

float alt_factor(in float eye_alt, in float vertex_alt)
{
float h0 = AtmosphericScaleHeight;
float h1 = min(eye_alt,vertex_alt);
float h2 = max(eye_alt,vertex_alt);


if ((h2-h1) < 200.0) // use a Taylor-expanded version
	{
	return  0.5 * (exp(-h2/h0) + exp(-h1/h0));
	}
else
	{
	return h0/(h2-h1) * (exp(-h1/h0) - exp(-h2/h0));
	}
}


// Rayleigh in-scatter function

float rayleigh_in_func(in float dist, in float air_pollution, in float avisibility, in float eye_alt, in float vertex_alt)
{

float fade_length = avisibility * (2.5 - 2.0 * air_pollution);

fade_length = fade_length / alt_factor(eye_alt, vertex_alt);

return 1.0-exp(-dist/max(35000.0,fade_length));
}


// Rayleigh out-scattering color shift

vec3 rayleigh_out_shift(in vec3 color, in float outscatter)
{
color.r = color.r * (1.0 - 0.4 * outscatter);
color.g = color.g * (1.0 - 0.8 * outscatter);
color.b = color.b * (1.0 - 1.6 * outscatter);

return color;
} 
